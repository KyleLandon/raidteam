import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPlayerCollection } from '../../../../lib/db/players';
import { getUserPoints } from '../../../../lib/db/crayons';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get playerId from URL parameters
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    const discordId = searchParams.get('discordId');
    
    if (!playerId && !discordId) {
      return NextResponse.json({ 
        error: 'Either playerId or discordId parameter is required' 
      }, { status: 400 });
    }
    
    // Get player collection
    const playerCollection = await getPlayerCollection();
    
    // Find player by ID or discordId
    let query = {};
    if (playerId) {
      try {
        query._id = new ObjectId(playerId);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid player ID format' }, { status: 400 });
      }
    } else if (discordId) {
      query.discordId = discordId;
    }
    
    const player = await playerCollection.findOne(query);
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    // Get player's points
    const pointsData = await getUserPoints(player._id.toString());
    
    // Combine player info with points data
    const playerData = {
      ...player,
      points: pointsData
    };
    
    return NextResponse.json({
      success: true,
      player: playerData
    });
    
  } catch (error) {
    console.error('Error in GET /api/crayon-points/get-player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 