import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
    }
});

export async function GET() {
    try {
        await client.connect();
        const db = client.db('raid-team');
        const charactersCollection = db.collection('characters');
        const historyCollection = db.collection('character_history');

        // Get all characters with their current points
        const characters = await charactersCollection
            .find({}, { projection: { _id: 0, id: 1, name: 1, realm: 1, currentPoints: 1, class: 1, spec: 1 } })
            .toArray();

        // Get the latest history entry for each character to get weekly points
        const latestHistory = await historyCollection
            .aggregate([
                {
                    $sort: { timestamp: -1 }
                },
                {
                    $group: {
                        _id: "$characterId",
                        weeklyPoints: { $first: "$points" }
                    }
                }
            ])
            .toArray();

        // Combine the data
        const leaderboard = characters.map(character => {
            const historyEntry = latestHistory.find(h => h._id === character.id);
            return {
                ...character,
                weeklyPoints: historyEntry ? historyEntry.weeklyPoints : 0
            };
        }).sort((a, b) => b.currentPoints - a.currentPoints);

        return NextResponse.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    } finally {
        await client.close();
    }
} 