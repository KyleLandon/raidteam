import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPlayerCollection } from '../../../../lib/db/players';

export async function POST(request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify the user is an officer
    const playerCollection = await getPlayerCollection();
    const currentPlayer = await playerCollection.findOne({ discordId: session.user.id });
    
    if (!currentPlayer?.isOfficer) {
      return NextResponse.json({ error: 'Unauthorized: Only officers can add players' }, { status: 403 });
    }
    
    // Get request data
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['discordId', 'username'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }
    
    // Check if player already exists
    const existingPlayer = await playerCollection.findOne({ discordId: data.discordId });
    
    if (existingPlayer) {
      return NextResponse.json({ 
        error: 'Player with this Discord ID already exists',
        player: existingPlayer
      }, { status: 409 });
    }
    
    // Create new player
    const newPlayer = {
      discordId: data.discordId,
      username: data.username,
      isOfficer: data.isOfficer || false,
      createdAt: new Date(),
      createdBy: session.user.id,
      createdByName: session.user.name,
      // Add any other fields needed
      avatar: data.avatar || null,
      notes: data.notes || ''
    };
    
    const result = await playerCollection.insertOne(newPlayer);
    
    return NextResponse.json({
      success: true,
      player: {
        ...newPlayer,
        _id: result.insertedId
      }
    });
    
  } catch (error) {
    console.error('Error in POST /api/crayon-points/add-player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 