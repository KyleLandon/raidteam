import { NextResponse } from 'next/server';
import { getUserPoints } from '../../../../lib/db/crayons';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: userId' 
      }, { status: 400 });
    }
    
    const userPoints = await getUserPoints(userId);
    
    if (!userPoints) {
      return NextResponse.json({ 
        error: 'User not found or has no points' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: userPoints
    });
    
  } catch (error) {
    console.error('Error in GET /api/crayon-points/user:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 