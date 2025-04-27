import { NextResponse } from 'next/server';
import { removePoints } from '../../../../lib/db/crayons';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      transactionId, 
      removedBy, 
      removedByName, 
      reason 
    } = body;
    
    // Validate required fields
    const requiredFields = ['transactionId', 'removedBy', 'removedByName', 'reason'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }
    
    // Remove points
    const result = await removePoints({
      transactionId,
      removedBy,
      removedByName,
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
    console.error('Error in POST /api/crayon-points/remove:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 