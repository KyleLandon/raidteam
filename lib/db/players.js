import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from './mongodb';

// Database and collection names
const DB_NAME = 'raidteam';
const COLLECTION_NAME = 'players';

/**
 * Get the players collection
 * @returns {Promise<Collection>} MongoDB collection for players
 */
export async function getPlayerCollection() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection(COLLECTION_NAME);
}

/**
 * Get a player by ID
 * @param {string} id - Player ID
 * @returns {Promise<Object>} Player object or null if not found
 */
export async function getPlayerById(id) {
  try {
    if (!id) throw new Error('Player ID is required');
    
    const collection = await getPlayerCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error('Error in getPlayerById:', error);
    return null;
  }
}

/**
 * Get a player by Discord ID
 * @param {string} discordId - Discord ID
 * @returns {Promise<Object>} Player object or null if not found
 */
export async function getPlayerByDiscordId(discordId) {
  try {
    if (!discordId) throw new Error('Discord ID is required');
    
    const collection = await getPlayerCollection();
    return await collection.findOne({ discordId });
  } catch (error) {
    console.error('Error in getPlayerByDiscordId:', error);
    return null;
  }
}

/**
 * Get all players
 * @param {Object} options - Query options
 * @param {Object} [options.filter={}] - MongoDB filter
 * @param {Object} [options.sort={ username: 1 }] - Sort options
 * @param {number} [options.limit=0] - Result limit (0 = no limit)
 * @returns {Promise<Array>} Array of players
 */
export async function getAllPlayers(options = {}) {
  try {
    const { 
      filter = {}, 
      sort = { username: 1 }, 
      limit = 0 
    } = options;
    
    const collection = await getPlayerCollection();
    
    return await collection
      .find(filter)
      .sort(sort)
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Error in getAllPlayers:', error);
    return [];
  }
}

/**
 * Create a new player
 * @param {Object} playerData - Player data
 * @returns {Promise<Object>} Result with success flag and player ID
 */
export async function createPlayer(playerData) {
  try {
    if (!playerData) throw new Error('Player data is required');
    if (!playerData.discordId) throw new Error('Discord ID is required');
    
    const collection = await getPlayerCollection();
    
    // Check if player already exists
    const existingPlayer = await getPlayerByDiscordId(playerData.discordId);
    if (existingPlayer) {
      return {
        success: false,
        error: 'Player with this Discord ID already exists',
        playerId: existingPlayer._id.toString()
      };
    }
    
    const now = new Date();
    const newPlayer = {
      ...playerData,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await collection.insertOne(newPlayer);
    
    return {
      success: true,
      playerId: result.insertedId.toString()
    };
  } catch (error) {
    console.error('Error in createPlayer:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update an existing player
 * @param {string} id - Player ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Result with success flag and modified count
 */
export async function updatePlayer(id, updateData) {
  try {
    if (!id) throw new Error('Player ID is required');
    if (!updateData) throw new Error('Update data is required');
    
    const collection = await getPlayerCollection();
    
    // Remove any attempt to modify _id
    const { _id, ...safeUpdateData } = updateData;
    
    // Add updated timestamp
    safeUpdateData.updatedAt = new Date();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: safeUpdateData }
    );
    
    return {
      success: true,
      modifiedCount: result.modifiedCount
    };
  } catch (error) {
    console.error('Error in updatePlayer:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete a player
 * @param {string} id - Player ID
 * @returns {Promise<Object>} Result with success flag and deleted count
 */
export async function deletePlayer(id) {
  try {
    if (!id) throw new Error('Player ID is required');
    
    const collection = await getPlayerCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    return {
      success: true,
      deletedCount: result.deletedCount
    };
  } catch (error) {
    console.error('Error in deletePlayer:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 