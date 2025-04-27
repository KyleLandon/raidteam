import { NextResponse } from 'next/server';
import { getLeaderboard } from '../../../../lib/db/crayons';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'season';
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const leaderboard = await getLeaderboard({
      period, // 'week', 'season', 'all'
      category, // 'raiding', 'social', 'all'
      limit
    });

    return NextResponse.json({ 
      success: true,
      leaderboard 
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
} 