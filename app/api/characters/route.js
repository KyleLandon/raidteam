import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import clientPromise from '../../../lib/mongodb';
import { logApiCall, logApiResponse, logApiError } from '../../../utils/debug';

export const config = {
    runtime: 'nodejs',
    regions: ['us-east-1'],
};

export async function GET() {
    logApiCall('GET', '/api/characters');
    
    try {
        const client = await clientPromise;
        const db = client.db('raidteam');
        
        const characters = await db.collection('characters')
            .find({})
            .sort({ points: -1 })
            .toArray();

        logApiResponse('GET', '/api/characters', { count: characters.length });
        return NextResponse.json(characters);
    } catch (error) {
        console.error('Error fetching characters:', error);
        return NextResponse.json(
            { error: 'Failed to fetch characters' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    logApiCall('POST', '/api/characters');
    
    try {
        const token = await getToken({ req: request });
        if (!token || !token.isAdmin) {
            logApiError('POST', '/api/characters', 'Unauthorized - Invalid role');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        const client = await clientPromise;
        const db = client.db('raidteam');
        
        const { characterId, points } = await request.json();
        console.log('[API] Update request:', { characterId, points });
        
        const result = await db.collection('characters').updateOne(
            { id: characterId },
            { $set: { points } }
        );

        if (result.matchedCount === 0) {
            logApiError('POST', '/api/characters', 'Character not found');
            return NextResponse.json(
                { error: 'Character not found' },
                { status: 404 }
            );
        }

        // Log the points update in history
        await db.collection('points_history').insertOne({
            characterId,
            points,
            updatedAt: new Date(),
            updatedBy: token.name
        });

        logApiResponse('POST', '/api/characters', result);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating character points:', error);
        return NextResponse.json(
            { error: 'Failed to update character points' },
            { status: 500 }
        );
    }
} 