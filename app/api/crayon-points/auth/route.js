import { NextResponse } from 'next/server';
import { getPlayerByDiscordId, addPlayer } from '@/lib/db/crayons';

// Simplified Discord auth function (would need complete Discord OAuth2 flow in production)
export async function POST(request) {
  try {
    const data = await request.json();
    const { discordId, username, discriminator, isOfficer = false } = data;
    
    if (!discordId) {
      return NextResponse.json({ error: 'Discord ID is required' }, { status: 400 });
    }
    
    // Check if player exists
    let player = await getPlayerByDiscordId(discordId);
    
    if (!player) {
      // Add new player
      const result = await addPlayer({
        discordId,
        playerName: username || 'Unknown Player',
        discordUsername: username,
        discordDiscriminator: discriminator,
        isOfficer,
        altCharacters: [],
        class: '',
        role: '',
        avatarUrl: ''
      });
      
      player = {
        _id: result.insertedId,
        discordId,
        playerName: username || 'Unknown Player',
        isOfficer
      };
    }
    
    // In a real app, you would create a JWT token here
    return NextResponse.json({
      success: true,
      player
    });
  } catch (error) {
    console.error('Error in auth endpoint:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
} 