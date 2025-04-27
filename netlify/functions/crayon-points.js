const { MongoClient } = require('mongodb');

// Setup MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Helper to validate required fields
const validateRequiredFields = (data, fields) => {
  const missingFields = fields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db('raidteam');
    const crayonsCollection = db.collection('crayons');
    const playersCollection = db.collection('players');

    // Parse path for operation
    const path = event.path.split('/').filter(Boolean);
    const operation = path[path.length - 1];
    
    // GET operations
    if (event.httpMethod === 'GET') {
      switch (operation) {
        case 'leaderboard': {
          const queryParams = event.queryStringParameters || {};
          const period = queryParams.period || 'all';
          const category = queryParams.category || null;
          const limit = parseInt(queryParams.limit) || 10;
          
          // Validate period
          if (!['all', 'season', 'week'].includes(period)) {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Invalid period: must be "all", "season", or "week"' }),
              headers
            };
          }
          
          // Calculate date ranges for periods
          const now = new Date();
          let dateFilter = {};
          
          if (period === 'week') {
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);
            dateFilter = { createdAt: { $gte: oneWeekAgo } };
          } else if (period === 'season') {
            // Season is 3 months
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            dateFilter = { createdAt: { $gte: threeMonthsAgo } };
          }
          
          // Add category filter if provided
          const filter = { 
            ...dateFilter,
            removed: { $ne: true }
          };
          
          if (category) {
            filter.category = category;
          }
          
          // Aggregate to calculate total points by user
          const leaderboard = await crayonsCollection.aggregate([
            { $match: filter },
            { $group: {
              _id: '$userId',
              username: { $first: '$username' },
              totalPoints: { $sum: '$points' }
            }},
            { $sort: { totalPoints: -1 } },
            { $limit: limit }
          ]).toArray();
          
          return {
            statusCode: 200,
            body: JSON.stringify(leaderboard),
            headers
          };
        }
        
        case 'user': {
          const userId = event.queryStringParameters?.userId;
          
          if (!userId) {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'userId is required' }),
              headers
            };
          }
          
          // Get user data
          const user = await playersCollection.findOne({ discordId: userId });
          
          if (!user) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'User not found' }),
              headers
            };
          }
          
          // Get all points (not removed)
          const allPoints = await crayonsCollection.find({ 
            userId,
            removed: { $ne: true }
          }).toArray();
          
          // Calculate totals
          const now = new Date();
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          
          const totalPoints = allPoints.reduce((sum, tx) => sum + tx.points, 0);
          const seasonPoints = allPoints
            .filter(tx => tx.createdAt >= threeMonthsAgo)
            .reduce((sum, tx) => sum + tx.points, 0);
          const weekPoints = allPoints
            .filter(tx => tx.createdAt >= oneWeekAgo)
            .reduce((sum, tx) => sum + tx.points, 0);
          
          // Calculate category breakdown
          const categoryBreakdown = {};
          allPoints.forEach(tx => {
            if (!categoryBreakdown[tx.category]) {
              categoryBreakdown[tx.category] = 0;
            }
            categoryBreakdown[tx.category] += tx.points;
          });
          
          // Get recent transactions (limit to 10)
          const recentTransactions = allPoints
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10);
          
          return {
            statusCode: 200,
            body: JSON.stringify({
              user,
              points: {
                total: totalPoints,
                season: seasonPoints,
                week: weekPoints,
                categoryBreakdown
              },
              recentTransactions
            }),
            headers
          };
        }
        
        case 'categories': {
          // Aggregate to get unique categories with counts and total points
          const categories = await crayonsCollection.aggregate([
            { $match: { removed: { $ne: true } } },
            { $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalPoints: { $sum: '$points' }
            }},
            { $sort: { _id: 1 } }
          ]).toArray();
          
          return {
            statusCode: 200,
            body: JSON.stringify(categories.map(cat => ({
              name: cat._id,
              count: cat.count,
              totalPoints: cat.totalPoints
            }))),
            headers
          };
        }
        
        default:
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Not found' }),
            headers
          };
      }
    }
    
    // POST operations
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      
      switch (operation) {
        case 'add': {
          // Validate required fields
          validateRequiredFields(data, [
            'userId', 'username', 'points', 'category', 'reason', 'issuedBy', 'issuedByName'
          ]);
          
          // Validate points
          const points = parseInt(data.points);
          if (isNaN(points) || points <= 0) {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Points must be a positive number' }),
              headers
            };
          }
          
          // Create transaction
          const transaction = {
            userId: data.userId,
            username: data.username,
            points,
            category: data.category,
            reason: data.reason,
            issuedBy: data.issuedBy,
            issuedByName: data.issuedByName,
            createdAt: new Date()
          };
          
          const result = await crayonsCollection.insertOne(transaction);
          
          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              transactionId: result.insertedId,
              transaction
            }),
            headers
          };
        }
        
        case 'remove': {
          // Validate required fields
          validateRequiredFields(data, [
            'transactionId', 'removedBy', 'removedByName', 'reason'
          ]);
          
          // Find transaction
          const { transactionId } = data;
          const transaction = await crayonsCollection.findOne({ 
            _id: transactionId,
            removed: { $ne: true }
          });
          
          if (!transaction) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Transaction not found or already removed' }),
              headers
            };
          }
          
          // Update transaction
          await crayonsCollection.updateOne(
            { _id: transactionId },
            { 
              $set: {
                removed: true,
                removedBy: data.removedBy,
                removedByName: data.removedByName,
                removalReason: data.reason,
                removedAt: new Date()
              }
            }
          );
          
          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              message: 'Transaction removed successfully'
            }),
            headers
          };
        }
        
        default:
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Not found' }),
            headers
          };
      }
    }
    
    // If we reach here, the operation wasn't handled
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
      headers
    };
    
  } catch (error) {
    console.error('Error in crayon-points function:', error);
    
    return {
      statusCode: error.message.includes('Missing required fields') ? 400 : 500,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      headers
    };
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}; 