import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPlayerCollection } from '../../../../lib/db/players';
import { ObjectId } from 'mongodb';

export async function PUT(request) {
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
      return NextResponse.json({ error: 'Unauthorized: Only officers can update players' }, { status: 403 });
    }
    
    // Get request data
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['playerId'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }
    
    // Find player to update
    let player;
    try {
      player = await playerCollection.findOne({ 
        _id: new ObjectId(data.playerId) 
      });
    } catch (error) {
      return NextResponse.json({ error: 'Invalid player ID format' }, { status: 400 });
    }
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    // Create update object with only allowed fields
    const allowedFields = ['username', 'isOfficer', 'avatar', 'notes'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    // Add audit fields
    updateData.updatedAt = new Date();
    updateData.updatedBy = session.user.id;
    updateData.updatedByName = session.user.name;
    
    // Update player
    const result = await playerCollection.updateOne(
      { _id: new ObjectId(data.playerId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    // Get updated player
    const updatedPlayer = await playerCollection.findOne({ 
      _id: new ObjectId(data.playerId) 
    });
    
    return NextResponse.json({
      success: true,
      player: updatedPlayer
    });
    
  } catch (error) {
    console.error('Error in PUT /api/crayon-points/update-player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 