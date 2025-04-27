import { NextResponse } from 'next/server';
import { addPoints } from '../../../../lib/db/crayons';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      username, 
      points, 
      category, 
      reason, 
      issuedBy, 
      issuedByName 
    } = body;
    
    // Validate required fields
    const requiredFields = ['userId', 'username', 'points', 'category', 'reason', 'issuedBy', 'issuedByName'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }
    
    // Validate points is a number and greater than 0
    if (isNaN(points) || points <= 0) {
      return NextResponse.json({ 
        error: 'Points must be a positive number' 
      }, { status: 400 });
    }
    
    // Add points
    const result = await addPoints({
      userId,
      username,
      points: Number(points),
      category,
      reason,
      issuedBy,
      issuedByName
    });
    
    return NextResponse.json({
      success: true,
      transaction: result
    });
    
  } catch (error) {
    console.error('Error in POST /api/crayon-points/add:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 