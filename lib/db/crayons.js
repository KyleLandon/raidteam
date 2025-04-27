import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from './mongodb';
import { getCurrentWeekStartDate, getCurrentSeasonStartDate } from '../utils/dates';

// Connect to MongoDB and return the crayons collection
async function getCrayonCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection('crayons');
}

// Connect to MongoDB and return the players collection
async function getPlayersCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection('players');
}

/**
 * Get player by Discord ID
 * @param {string} discordId - Discord ID of the player
 * @returns {Promise<Object>} Player object or null if not found
 */
export async function getPlayerByDiscordId(discordId) {
  if (!discordId) throw new Error('Discord ID is required');
  
  const players = await getPlayersCollection();
  return await players.findOne({ discordId });
}

/**
 * Add a new player
 * @param {Object} playerData - Player data object
 * @returns {Promise<Object>} Result with insertedId
 */
export async function addPlayer(playerData) {
  if (!playerData.discordId) throw new Error('Discord ID is required');
  
  const players = await getPlayersCollection();
  
  const now = new Date();
  
  const player = {
    ...playerData,
    joinedAt: now,
    updatedAt: now
  };
  
  const result = await players.insertOne(player);
  
  return {
    success: true,
    insertedId: result.insertedId.toString()
  };
}

/**
 * Get all players
 * @returns {Promise<Array>} Array of players
 */
export async function getPlayers() {
  const players = await getPlayersCollection();
  return await players.find().sort({ playerName: 1 }).toArray();
}

/**
 * Award crayon points to a player (alias for addPoints)
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Result with transaction ID
 */
export async function awardCrayonPoints(params) {
  return addPoints(params);
}

/**
 * Add points to a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {number} params.amount - Amount of points
 * @param {string} params.category - Points category
 * @param {string} params.reason - Reason for adding points
 * @param {string} params.addedBy - Officer ID who added the points
 * @returns {Promise<Object>} Result with transaction ID
 */
export async function addPoints({ userId, amount, category, reason, addedBy }) {
  // Validate parameters
  if (!userId) throw new Error('User ID is required');
  if (!amount || isNaN(amount)) throw new Error('Valid amount is required');
  if (!category) throw new Error('Category is required');
  if (!reason) throw new Error('Reason is required');
  if (!addedBy) throw new Error('Added by is required');

  const collection = await getCrayonCollection();
  
  const now = new Date();
  const transaction = {
    userId,
    amount: Number(amount),
    category,
    reason,
    addedBy,
    timestamp: now,
    weekStartDate: getCurrentWeekStartDate(),
    seasonStartDate: getCurrentSeasonStartDate(),
    removed: false
  };
  
  const result = await collection.insertOne(transaction);
  
  return {
    success: true,
    transactionId: result.insertedId.toString(),
    transaction
  };
}

/**
 * Remove (mark as removed) a points transaction
 * @param {Object} params - Parameters
 * @param {string} params.transactionId - Transaction ID to remove
 * @param {string} params.reason - Reason for removing points
 * @param {string} params.removedBy - Officer ID who removed the points
 * @returns {Promise<Object>} Result of the operation
 */
export async function removePoints({ transactionId, reason, removedBy }) {
  // Validate parameters
  if (!transactionId) throw new Error('Transaction ID is required');
  if (!reason) throw new Error('Reason is required');
  if (!removedBy) throw new Error('Removed by is required');
  
  const collection = await getCrayonCollection();
  
  const now = new Date();
  const result = await collection.updateOne(
    { _id: new ObjectId(transactionId) },
    { 
      $set: { 
        removed: true,
        removedReason: reason,
        removedBy,
        removedTimestamp: now
      } 
    }
  );
  
  if (result.matchedCount === 0) {
    throw new Error('Transaction not found');
  }
  
  return {
    success: true,
    transactionId
  };
}

/**
 * Get leaderboard for a specific period
 * @param {Object} params - Parameters
 * @param {string} params.period - Period ('week', 'season', 'all')
 * @param {string} [params.category] - Optional category filter
 * @param {number} [params.limit=10] - Limit of results
 * @returns {Promise<Array>} Leaderboard array
 */
export async function getLeaderboard({ period = 'season', category, limit = 10 }) {
  const collection = await getCrayonCollection();
  
  const match = { removed: false };
  
  // Add period filter
  if (period === 'week') {
    match.weekStartDate = getCurrentWeekStartDate();
  } else if (period === 'season') {
    match.seasonStartDate = getCurrentSeasonStartDate();
  }
  
  // Add category filter if specified
  if (category) {
    match.category = category;
  }
  
  const aggregation = [
    { $match: match },
    { 
      $group: {
        _id: '$userId',
        totalPoints: { $sum: '$amount' },
        transactions: { $count: {} }
      }
    },
    { $sort: { totalPoints: -1 } },
    { $limit: limit }
  ];
  
  const leaderboard = await collection.aggregate(aggregation).toArray();
  
  return leaderboard.map(entry => ({
    userId: entry._id,
    points: entry.totalPoints,
    transactions: entry.transactions
  }));
}

/**
 * Get user points summary and recent transactions
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {number} [params.transactionLimit=10] - Limit of transactions to return
 * @returns {Promise<Object>} User points data
 */
export async function getUserPoints({ userId, transactionLimit = 10 }) {
  if (!userId) throw new Error('User ID is required');
  
  const collection = await getCrayonCollection();
  
  // Get point totals
  const totals = await collection.aggregate([
    { $match: { userId, removed: false } },
    {
      $facet: {
        // All time
        allTime: [
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ],
        // Current season
        season: [
          { 
            $match: { seasonStartDate: getCurrentSeasonStartDate() }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ],
        // Current week
        week: [
          { 
            $match: { weekStartDate: getCurrentWeekStartDate() }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ],
        // By category
        byCategory: [
          {
            $group: {
              _id: '$category',
              total: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { total: -1 } }
        ]
      }
    }
  ]).toArray();
  
  // Get recent transactions
  const transactions = await collection.find({ userId })
    .sort({ timestamp: -1 })
    .limit(transactionLimit)
    .toArray();
  
  const result = totals[0];
  
  return {
    userId,
    points: {
      total: result.allTime[0]?.total || 0,
      season: result.season[0]?.total || 0,
      week: result.week[0]?.total || 0,
      byCategory: result.byCategory.map(cat => ({
        category: cat._id,
        total: cat.total,
        count: cat.count
      }))
    },
    recentTransactions: transactions.map(t => ({
      id: t._id.toString(),
      amount: t.amount,
      category: t.category,
      reason: t.reason,
      timestamp: t.timestamp,
      removed: t.removed,
      removedReason: t.removedReason,
      removedTimestamp: t.removedTimestamp
    }))
  };
}

/**
 * Get point categories with counts
 * @returns {Promise<Array>} Categories array
 */
export async function getPointCategories() {
  const collection = await getCrayonCollection();
  
  const categories = await collection.aggregate([
    { $match: { removed: false } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalPoints: { $sum: '$amount' }
      }
    },
    { $sort: { count: -1 } }
  ]).toArray();
  
  return categories.map(cat => ({
    category: cat._id,
    count: cat.count,
    totalPoints: cat.totalPoints
  }));
} 