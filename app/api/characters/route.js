import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
    runtime: 'edge',
    regions: ['iad1'],
};

export async function GET(request) {
    try {
        const token = await getToken({ req: request });
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First, get the list of characters
        const charactersResponse = await fetch('https://wowaudit.com/v1/characters', {
            headers: {
                'Authorization': `Bearer ${process.env.WOWAUDIT_API_KEY}`
            }
        });
        
        if (charactersResponse.status === 401) {
            return NextResponse.json({ error: 'Unauthorized - Invalid API key' }, { status: 401 });
        }
        if (charactersResponse.status === 404) {
            return NextResponse.json({ error: 'Characters not found' }, { status: 404 });
        }
        if (!charactersResponse.ok) {
            throw new Error('Failed to fetch character data');
        }
        
        const characters = await charactersResponse.json();
        
        // For each character, fetch their historical data
        const charactersWithHistory = await Promise.all(
            characters.map(async (character) => {
                const historyResponse = await fetch(`https://wowaudit.com/v1/historical_data/${character.id}`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.WOWAUDIT_API_KEY}`
                    }
                });
                
                if (!historyResponse.ok) {
                    console.error(`Failed to fetch history for character ${character.id}`);
                    return {
                        ...character,
                        history: [],
                        points: 0
                    };
                }
                
                const history = await historyResponse.json();
                
                // Calculate points based on historical data
                const points = calculatePoints(history);
                
                return {
                    ...character,
                    history,
                    points
                };
            })
        );
        
        return NextResponse.json(charactersWithHistory);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function calculatePoints(history) {
    let points = 0;
    
    // Add points for raid attendance
    if (history.raids_attended) {
        points += history.raids_attended * 20;
    }
    
    // Add points for dungeons based on level
    if (history.dungeons_done) {
        history.dungeons_done.forEach(dungeon => {
            if (dungeon.level < 10) {
                points += 3;
            } else {
                points += 5;
            }
        });
    }
    
    return points;
}

export async function POST(request) {
    try {
        const token = await getToken({ req: request });
        if (!token || token.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { characterId, points } = await request.json();
        
        const response = await fetch('https://wowaudit.com/v1/characters/update', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WOWAUDIT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ characterId, points })
        });
        
        if (response.status === 401) {
            return NextResponse.json({ error: 'Unauthorized - Invalid API key' }, { status: 401 });
        }
        if (response.status === 404) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }
        if (!response.ok) {
            throw new Error('Failed to update character');
        }
        
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 