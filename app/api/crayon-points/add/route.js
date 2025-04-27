import { NextResponse } from 'next/server';
import { addPoints } from '../../../../lib/db/crayons';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isOfficer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { playerId, category, points, reason } = data;

    // Validate required fields
    if (!playerId || !category || !points || isNaN(parseInt(points))) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: playerId, category, and points are required. Points must be a number.'
      }, { status: 400 });
    }

    // Add points
    const result = await addPoints({
      userId: playerId,
      amount: parseInt(points, 10),
      category,
      reason: reason || '',
      addedBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json({ error: 'Failed to add points' }, { status: 500 });
  }
} 