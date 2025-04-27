import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { addPoints } from '../../../../lib/db/crayons';
import { getPlayerCollection } from '../../../../lib/db/players';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    // Check if user is authenticated and an officer
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only officers can add points
    const issuerPlayerCollection = await getPlayerCollection();
    const issuer = await issuerPlayerCollection.findOne({ 
      discordId: session.user.id 
    });

    if (!issuer || !issuer.isOfficer) {
      return NextResponse.json({ 
        error: 'Only officers can add points' 
      }, { status: 403 });
    }

    // Get request data
    const data = await request.json();
    const { 
      playerId, 
      points, 
      category, 
      reason 
    } = data;

    // Validate required fields
    const requiredFields = ['playerId', 'points', 'category', 'reason'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Validate points value
    if (isNaN(points) || points <= 0) {
      return NextResponse.json({ 
        error: 'Points must be a positive number' 
      }, { status: 400 });
    }

    // Get player info
    const playerCollection = await getPlayerCollection();
    let player;
    
    try {
      player = await playerCollection.findOne({ _id: new ObjectId(playerId) });
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid player ID format' 
      }, { status: 400 });
    }

    if (!player) {
      return NextResponse.json({ 
        error: 'Player not found' 
      }, { status: 404 });
    }

    // Add points to player
    const result = await addPoints({
      userId: player._id.toString(),
      username: player.username,
      points: Number(points),
      category,
      reason,
      issuedBy: issuer._id.toString(),
      issuedByName: issuer.username
    });

    return NextResponse.json({
      success: true,
      transaction: result
    });

  } catch (error) {
    console.error('Error in POST /api/crayon-points/add-points:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 