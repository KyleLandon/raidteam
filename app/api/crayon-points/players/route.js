import { NextResponse } from 'next/server';
import { getPlayers } from '../../../../lib/db/crayons';

export async function GET() {
  try {
    const players = await getPlayers();
    
    return NextResponse.json({
      success: true,
      players
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
} 