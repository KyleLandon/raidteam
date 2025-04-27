import { NextResponse } from 'next/server';
import { awardCrayonPoints } from '../../../../lib/db/crayons';

export async function POST(request) {
  try {
    const data = await request.json();
    const { playerId, category, amount, reason, awardedBy } = data;
    
    // Validate required fields
    if (!playerId || !category || !amount || !awardedBy) {
      return NextResponse.json({ 
        error: 'Missing required fields: playerId, category, amount, and awardedBy are required' 
      }, { status: 400 });
    }
    
    // Award points and update weekly/season totals
    const result = await awardCrayonPoints({
      userId: playerId,
      category,
      amount: parseInt(amount, 10),
      reason: reason || '',
      addedBy: awardedBy
    });
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error awarding crayon points:', error);
    return NextResponse.json({ error: 'Failed to award points' }, { status: 500 });
  }
} 