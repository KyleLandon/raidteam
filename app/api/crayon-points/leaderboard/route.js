import { NextResponse } from 'next/server';
import { getLeaderboard } from '../../../../lib/db/crayons';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 10;
    
    // Validate period
    if (!['all', 'season', 'week'].includes(period)) {
      return NextResponse.json({ 
        error: 'Invalid period. Must be one of: all, season, week' 
      }, { status: 400 });
    }
    
    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ 
        error: 'Invalid limit. Must be a number between 1 and 100' 
      }, { status: 400 });
    }
    
    const leaderboard = await getLeaderboard(period, category, limit);
    
    return NextResponse.json({
      success: true,
      data: {
        period,
        category: category || 'all',
        limit,
        leaderboard
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/crayon-points/leaderboard:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 