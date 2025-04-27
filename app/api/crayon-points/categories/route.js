import { NextResponse } from 'next/server';
import { getPointCategories } from '../../../../lib/db/crayons';

export async function GET() {
  try {
    const categories = await getPointCategories();
    
    return NextResponse.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Error in GET /api/crayon-points/categories:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 