import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { removePoints } from '../../../../lib/db/crayons';
import { getPlayerCollection } from '../../../../lib/db/players';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    // Check if user is authenticated and an officer
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only officers can remove points
    const issuerPlayerCollection = await getPlayerCollection();
    const issuer = await issuerPlayerCollection.findOne({ 
      discordId: session.user.id 
    });

    if (!issuer || !issuer.isOfficer) {
      return NextResponse.json({ 
        error: 'Only officers can remove points' 
      }, { status: 403 });
    }

    // Get request data
    const data = await request.json();
    const { transactionId, reason } = data;

    // Validate required fields
    const requiredFields = ['transactionId', 'reason'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Remove the points transaction
    const result = await removePoints({
      transactionId,
      removedBy: issuer._id.toString(),
      removedByName: issuer.username,
      reason
    });

    if (!result) {
      return NextResponse.json({ 
        error: 'Transaction not found or already removed' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      transaction: result
    });

  } catch (error) {
    console.error('Error in POST /api/crayon-points/remove-points:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 