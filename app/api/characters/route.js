import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logApiCall, logApiResponse, logApiError } from '../../../utils/debug';

export const config = {
    runtime: 'nodejs',
};

export async function GET(request) {
    logApiCall('GET', '/api/characters');
    
    try {
        const token = await getToken({ req: request });
        if (!token) {
            logApiError('GET', '/api/characters', 'Unauthorized - No token');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First, get the list of characters
        logApiCall('GET', 'https://wowaudit.com/v1/characters');
        const charactersResponse = await fetch('https://wowaudit.com/v1/characters', {
            headers: {
                'Authorization': `Bearer ${process.env.WOWAUDIT_API_KEY}`
            }
        });
        
        logApiResponse('GET', 'https://wowaudit.com/v1/characters', charactersResponse);
        
        if (charactersResponse.status === 401) {
            logApiError('GET', 'https://wowaudit.com/v1/characters', 'Unauthorized - Invalid API key');
            return NextResponse.json({ error: 'Unauthorized - Invalid API key' }, { status: 401 });
        }
        if (charactersResponse.status === 404) {
            logApiError('GET', 'https://wowaudit.com/v1/characters', 'Characters not found');
            return NextResponse.json({ error: 'Characters not found' }, { status: 404 });
        }
        if (!charactersResponse.ok) {
            throw new Error('Failed to fetch character data');
        }
        
        const characters = await charactersResponse.json();
        console.log('[API] Characters data:', characters);
        
        // For each character, fetch their historical data
        const charactersWithHistory = await Promise.all(
            characters.map(async (character) => {
                logApiCall('GET', `https://wowaudit.com/v1/historical_data/${character.id}`);
                const historyResponse = await fetch(`https://wowaudit.com/v1/historical_data/${character.id}`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.WOWAUDIT_API_KEY}`
                    }
                });
                
                logApiResponse('GET', `https://wowaudit.com/v1/historical_data/${character.id}`, historyResponse);
                
                if (!historyResponse.ok) {
                    console.error(`Failed to fetch history for character ${character.id}`);
                    return {
                        ...character,
                        history: [],
                        points: 0
                    };
                }
                
                const history = await historyResponse.json();
                console.log(`[API] History for character ${character.id}:`, history);
                
                // Calculate points based on historical data
                const points = calculatePoints(history);
                
                return {
                    ...character,
                    history,
                    points
                };
            })
        );
        
        logApiResponse('GET', '/api/characters', { status: 200, data: charactersWithHistory });
        return NextResponse.json(charactersWithHistory);
    } catch (error) {
        logApiError('GET', '/api/characters', error);
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
    logApiCall('POST', '/api/characters');
    
    try {
        const token = await getToken({ req: request });
        if (!token || token.role !== 'admin') {
            logApiError('POST', '/api/characters', 'Unauthorized - Invalid role');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { characterId, points } = await request.json();
        console.log('[API] Update request:', { characterId, points });
        
        logApiCall('POST', 'https://wowaudit.com/v1/characters/update', { characterId, points });
        const response = await fetch('https://wowaudit.com/v1/characters/update', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WOWAUDIT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ characterId, points })
        });
        
        logApiResponse('POST', 'https://wowaudit.com/v1/characters/update', response);
        
        if (response.status === 401) {
            logApiError('POST', 'https://wowaudit.com/v1/characters/update', 'Unauthorized - Invalid API key');
            return NextResponse.json({ error: 'Unauthorized - Invalid API key' }, { status: 401 });
        }
        if (response.status === 404) {
            logApiError('POST', 'https://wowaudit.com/v1/characters/update', 'Character not found');
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }
        if (!response.ok) {
            throw new Error('Failed to update character');
        }
        
        const data = await response.json();
        logApiResponse('POST', '/api/characters', { status: 200, data });
        return NextResponse.json(data);
    } catch (error) {
        logApiError('POST', '/api/characters', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 