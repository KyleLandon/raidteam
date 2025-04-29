import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('raidteam');
    
    // Fetch characters from WowAudit
    const response = await fetch('https://wowaudit.com/api/v1/characters', {
      headers: {
        'Authorization': `Bearer ${process.env.WOWAUDIT_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch characters from WowAudit');
    }

    const characters = await response.json();

    // Store characters in MongoDB
    const result = await db.collection('characters').bulkWrite(
      characters.map(character => ({
        updateOne: {
          filter: { id: character.id },
          update: { $set: character },
          upsert: true
        }
      }))
    );

    return NextResponse.json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    });
  } catch (error) {
    console.error('Error syncing characters:', error);
    return NextResponse.json(
      { error: 'Failed to sync characters' },
      { status: 500 }
    );
  }
} 