import { NextResponse } from 'next/server';
import { removePoints } from '../../../../lib/db/crayons';
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
    const { transactionId, reason } = data;

    // Validate required fields
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: transactionId'
      }, { status: 400 });
    }

    // Remove points
    const result = await removePoints({
      transactionId,
      reason: reason || 'Points removed by officer',
      removedBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error removing points:', error);
    return NextResponse.json({ error: 'Failed to remove points' }, { status: 500 });
  }
} 