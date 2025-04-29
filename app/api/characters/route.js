import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import clientPromise from '../../../lib/mongodb';
import { logApiCall, logApiResponse, logApiError } from '../../../utils/debug';

export const config = {
    runtime: 'nodejs',
    regions: ['us-east-1'],
};

export async function GET(request) {
    logApiCall('GET', '/api/characters');
    
    try {
        const token = await getToken({ req: request });
        if (!token) {
            logApiError('GET', '/api/characters', 'Unauthorized - No token');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get MongoDB connection
        const client = await clientPromise;
        const db = client.db("raidteam");

        // Get characters from MongoDB
        const characters = await db.collection('characters')
            .find({})
            .sort({ points: -1 })
            .toArray();

        logApiResponse('GET', '/api/characters', { count: characters.length });
        return NextResponse.json(characters);
    } catch (error) {
        logApiError('GET', '/api/characters', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    logApiCall('POST', '/api/characters');
    
    try {
        const token = await getToken({ req: request });
        if (!token || token.role !== 'admin') {
            logApiError('POST', '/api/characters', 'Unauthorized - Invalid role');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { characterId, points } = await request.json();
        console.log('[API] Update request:', { characterId, points });
        
        // Get MongoDB connection
        const client = await clientPromise;
        const db = client.db("raidteam");

        // Update character points in MongoDB
        const result = await db.collection('characters').updateOne(
            { id: characterId },
            { 
                $set: { 
                    points,
                    lastUpdated: new Date().toISOString(),
                    pointsUpdatedBy: token.name || 'admin'
                }
            }
        );

        if (result.matchedCount === 0) {
            logApiError('POST', '/api/characters', 'Character not found');
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        // Log the points update in history
        await db.collection('points_history').insertOne({
            characterId,
            points,
            updatedBy: token.name || 'admin',
            timestamp: new Date().toISOString()
        });

        logApiResponse('POST', '/api/characters', result);
        return NextResponse.json({ 
            success: true,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        logApiError('POST', '/api/characters', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 