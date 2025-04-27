import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { addPoints, removePoints, getLeaderboard, getUserPoints } from '@/lib/db/crayons';
import { NextResponse } from 'next/server';

// Helper to check if user has officer role
function isOfficer(user) {
  return user?.roles?.includes('officer') || user?.roles?.includes('admin');
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  
  // Endpoint for getting leaderboard
  if (params.action === 'leaderboard') {
    try {
      const { period = 'season', category, limit = 10 } = params;
      const leaderboard = await getLeaderboard({ 
        period, 
        category, 
        limit: parseInt(limit, 10) 
      });
      return NextResponse.json({ success: true, leaderboard });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 400 }
      );
    }
  }
  
  // Endpoint for getting user points
  if (params.action === 'userPoints') {
    try {
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' }, 
          { status: 401 }
        );
      }
      
      // Default to current user, officers can request other users
      let userId = session.user.id;
      if (params.userId && isOfficer(session.user)) {
        userId = params.userId;
      }
      
      const userPoints = await getUserPoints({ 
        userId,
        transactionLimit: parseInt(params.limit || '10', 10)
      });
      
      return NextResponse.json({ success: true, ...userPoints });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 400 }
      );
    }
  }
  
  return NextResponse.json(
    { success: false, error: 'Invalid action' }, 
    { status: 400 }
  );
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  // Check authentication
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' }, 
      { status: 401 }
    );
  }
  
  // Check officer role for adding/removing points
  if (!isOfficer(session.user)) {
    return NextResponse.json(
      { success: false, error: 'Permission denied - Officer role required' }, 
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    const { action } = body;
    
    // Handle add points action
    if (action === 'add') {
      const { userId, amount, category, reason } = body;
      
      const result = await addPoints({
        userId,
        amount: Number(amount),
        category,
        reason,
        addedBy: session.user.id
      });
      
      return NextResponse.json(result);
    }
    
    // Handle remove points action
    if (action === 'remove') {
      const { transactionId, reason } = body;
      
      const result = await removePoints({
        transactionId,
        reason,
        removedBy: session.user.id
      });
      
      return NextResponse.json(result);
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' }, 
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 400 }
    );
  }
} 