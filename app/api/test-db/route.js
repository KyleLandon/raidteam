import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { logApiCall, logApiResponse, logApiError } from '../../../utils/debug';

export async function GET() {
    logApiCall('GET', '/api/test-db');
    
    try {
        const client = await clientPromise;
        const db = client.db("raidteam");
        
        // Test the connection by listing collections
        const collections = await db.listCollections().toArray();
        
        const status = {
            connected: true,
            database: "raidteam",
            collections: collections.map(col => col.name),
            timestamp: new Date().toISOString()
        };
        
        logApiResponse('GET', '/api/test-db', status);
        return NextResponse.json(status);
    } catch (error) {
        logApiError('GET', '/api/test-db', error);
        return NextResponse.json({ 
            connected: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
} 