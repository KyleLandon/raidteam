import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import clientPromise from '../../../lib/mongodb';
import { logApiCall, logApiResponse, logApiError } from '../../../utils/debug';

// Point calculation constants
const POINTS_PER_MYTHIC_PLUS = 1;
const POINTS_PER_WORLD_QUEST = 0.1;
const POINTS_PER_VAULT_OPTION = 2;

// Crayon points calculation constants
const CRAYON_POINTS = {
    MYTHIC_PLUS: {
        BASE: 1,
        BONUS_PER_LEVEL: 0.5,
        MAX_LEVEL_BONUS: 5
    },
    WORLD_QUESTS: {
        BASE: 0.1,
        BONUS_PER_QUEST: 0.05,
        MAX_QUEST_BONUS: 2
    },
    VAULT: {
        BASE: 2,
        BONUS_PER_OPTION: 1,
        MAX_OPTION_BONUS: 3
    },
    SPECIAL_BONUSES: {
        HIGHEST_KEY: 10,
        MOST_QUESTS: 5,
        MOST_VAULT_OPTIONS: 5
    }
};

function calculateCrayonPoints(historicalData, allCharactersData) {
    let points = 0;
    
    // Calculate base points from dungeons
    if (historicalData.dungeons_done) {
        points += historicalData.dungeons_done.reduce((total, dungeon) => {
            const basePoints = dungeon.level * CRAYON_POINTS.MYTHIC_PLUS.BASE;
            const levelBonus = Math.min(
                (dungeon.level - 10) * CRAYON_POINTS.MYTHIC_PLUS.BONUS_PER_LEVEL,
                CRAYON_POINTS.MYTHIC_PLUS.MAX_LEVEL_BONUS
            );
            return total + basePoints + levelBonus;
        }, 0);
    }
    
    // Calculate points from world quests
    if (historicalData.world_quests_done) {
        const basePoints = historicalData.world_quests_done * CRAYON_POINTS.WORLD_QUESTS.BASE;
        const questBonus = Math.min(
            historicalData.world_quests_done * CRAYON_POINTS.WORLD_QUESTS.BONUS_PER_QUEST,
            CRAYON_POINTS.WORLD_QUESTS.MAX_QUEST_BONUS
        );
        points += basePoints + questBonus;
    }
    
    // Calculate points from vault options
    if (historicalData.vault_options) {
        const vaultOptions = historicalData.vault_options;
        let totalOptions = 0;
        
        ['raids', 'dungeons', 'world'].forEach(category => {
            if (vaultOptions[category]) {
                Object.values(vaultOptions[category]).forEach(option => {
                    if (option) {
                        totalOptions++;
                        points += CRAYON_POINTS.VAULT.BASE;
                    }
                });
            }
        });
        
        // Add bonus for multiple vault options
        const optionBonus = Math.min(
            totalOptions * CRAYON_POINTS.VAULT.BONUS_PER_OPTION,
            CRAYON_POINTS.VAULT.MAX_OPTION_BONUS
        );
        points += optionBonus;
    }
    
    // Calculate special bonuses
    if (allCharactersData) {
        // Find highest key level
        const highestKey = allCharactersData.reduce((max, char) => {
            if (!char.data?.dungeons_done) return max;
            const charMax = Math.max(...char.data.dungeons_done.map(d => d.level));
            return Math.max(max, charMax);
        }, 0);
        
        // Find most world quests
        const mostQuests = allCharactersData.reduce((max, char) => {
            if (!char.data?.world_quests_done) return max;
            return Math.max(max, char.data.world_quests_done);
        }, 0);
        
        // Find most vault options
        const mostVaultOptions = allCharactersData.reduce((max, char) => {
            if (!char.data?.vault_options) return max;
            let options = 0;
            ['raids', 'dungeons', 'world'].forEach(category => {
                if (char.data.vault_options[category]) {
                    options += Object.values(char.data.vault_options[category])
                        .filter(opt => opt !== null).length;
                }
            });
            return Math.max(max, options);
        }, 0);
        
        // Add special bonuses if this character has the highest
        if (historicalData.dungeons_done) {
            const charHighestKey = Math.max(...historicalData.dungeons_done.map(d => d.level));
            if (charHighestKey === highestKey) {
                points += CRAYON_POINTS.SPECIAL_BONUSES.HIGHEST_KEY;
            }
        }
        
        if (historicalData.world_quests_done === mostQuests) {
            points += CRAYON_POINTS.SPECIAL_BONUSES.MOST_QUESTS;
        }
        
        if (historicalData.vault_options) {
            let charVaultOptions = 0;
            ['raids', 'dungeons', 'world'].forEach(category => {
                if (historicalData.vault_options[category]) {
                    charVaultOptions += Object.values(historicalData.vault_options[category])
                        .filter(opt => opt !== null).length;
                }
            });
            if (charVaultOptions === mostVaultOptions) {
                points += CRAYON_POINTS.SPECIAL_BONUSES.MOST_VAULT_OPTIONS;
            }
        }
    }
    
    return Math.round(points * 10) / 10; // Round to 1 decimal place
}

function calculatePoints(historicalData) {
    let points = 0;
    
    // Calculate points from dungeons
    if (historicalData.dungeons_done) {
        points += historicalData.dungeons_done.reduce((total, dungeon) => {
            return total + (dungeon.level * POINTS_PER_MYTHIC_PLUS);
        }, 0);
    }
    
    // Calculate points from world quests
    if (historicalData.world_quests_done) {
        points += historicalData.world_quests_done * POINTS_PER_WORLD_QUEST;
    }
    
    // Calculate points from vault options
    if (historicalData.vault_options) {
        const vaultOptions = historicalData.vault_options;
        ['raids', 'dungeons', 'world'].forEach(category => {
            if (vaultOptions[category]) {
                Object.values(vaultOptions[category]).forEach(option => {
                    if (option) {
                        points += POINTS_PER_VAULT_OPTION;
                    }
                });
            }
        });
    }
    
    return Math.round(points * 10) / 10; // Round to 1 decimal place
}

export async function POST(request) {
    logApiCall('POST', '/api/sync');
    
    try {
        const token = await getToken({ req: request });
        if (!token || token.role !== 'admin') {
            logApiError('POST', '/api/sync', 'Unauthorized - Invalid role');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get MongoDB connection
        const client = await clientPromise;
        const db = client.db("raidteam");

        // Fetch characters from WowAudit
        logApiCall('GET', 'https://wowaudit.com/v1/characters');
        const charactersResponse = await fetch('https://wowaudit.com/v1/characters', {
            headers: {
                'Authorization': `Bearer ${process.env.WOWAUDIT_API_KEY}`
            }
        });

        if (!charactersResponse.ok) {
            throw new Error('Failed to fetch characters from WowAudit');
        }

        const characters = await charactersResponse.json();
        logApiResponse('GET', 'https://wowaudit.com/v1/characters', { count: characters.length });

        // Fetch historical data for all characters first
        const allHistoricalData = await Promise.all(
            characters.map(async (character) => {
                logApiCall('GET', `https://wowaudit.com/v1/historical_data/${character.id}`);
                const historyResponse = await fetch(`https://wowaudit.com/v1/historical_data/${character.id}`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.WOWAUDIT_API_KEY}`
                    }
                });

                if (!historyResponse.ok) {
                    console.error(`Failed to fetch history for character ${character.id}`);
                    return null;
                }

                const history = await historyResponse.json();
                const characterData = history.characters.find(c => c.id === character.id);
                return characterData;
            })
        );

        // Process each character with the complete historical data
        const charactersWithHistory = await Promise.all(
            characters.map(async (character) => {
                const characterData = allHistoricalData.find(data => data?.id === character.id);
                const points = characterData ? calculatePoints(characterData.data) : 0;
                const crayonPoints = characterData ? calculateCrayonPoints(characterData.data, allHistoricalData) : 0;

                return {
                    ...character,
                    history: characterData ? characterData.data : {},
                    points,
                    crayonPoints,
                    lastSynced: new Date().toISOString()
                };
            })
        );

        // Store in MongoDB
        const result = await db.collection('characters').bulkWrite(
            charactersWithHistory.map(character => ({
                updateOne: {
                    filter: { id: character.id },
                    update: { $set: character },
                    upsert: true
                }
            }))
        );

        logApiResponse('POST', '/api/sync', {
            charactersSynced: result.modifiedCount + result.upsertedCount,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount
        });

        return NextResponse.json({
            success: true,
            charactersSynced: result.modifiedCount + result.upsertedCount,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount
        });
    } catch (error) {
        logApiError('POST', '/api/sync', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 