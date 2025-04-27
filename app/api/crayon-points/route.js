import { NextResponse } from 'next/server';
import { getCrayonCollection } from '../../../lib/db/crayons';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPlayerById } from '../../../lib/db/players';

// Helper to validate required fields
const validateRequiredFields = (data, fields) => {
  const missingFields = fields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    return {
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  return null;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    
    if (!operation) {
      return NextResponse.json({ error: 'Operation parameter is required' }, { status: 400 });
    }

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const crayonCollection = await getCrayonCollection();

    switch (operation) {
      case 'leaderboard': {
        const period = searchParams.get('period') || 'all';
        const category = searchParams.get('category') || null;
        const limit = parseInt(searchParams.get('limit')) || 10;
        
        // Validate period
        if (!['all', 'season', 'week'].includes(period)) {
          return NextResponse.json({ error: 'Invalid period: must be "all", "season", or "week"' }, { status: 400 });
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
        const leaderboard = await crayonCollection.aggregate([
          { $match: filter },
          { $group: {
            _id: '$userId',
            username: { $first: '$username' },
            totalPoints: { $sum: '$points' }
          }},
          { $sort: { totalPoints: -1 } },
          { $limit: limit }
        ]).toArray();
        
        return NextResponse.json(leaderboard);
      }
      
      case 'user': {
        const userId = searchParams.get('userId') || session.user.id;
        
        // Get user data
        const user = await getPlayerById(userId);
        
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // Get all points (not removed)
        const allPoints = await crayonCollection.find({ 
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
        
        return NextResponse.json({
          user,
          points: {
            total: totalPoints,
            season: seasonPoints,
            week: weekPoints,
            categoryBreakdown
          },
          recentTransactions
        });
      }
      
      case 'categories': {
        // Aggregate to get unique categories with counts and total points
        const categories = await crayonCollection.aggregate([
          { $match: { removed: { $ne: true } } },
          { $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalPoints: { $sum: '$points' }
          }},
          { $sort: { _id: 1 } }
        ]).toArray();
        
        return NextResponse.json(categories.map(cat => ({
          name: cat._id,
          count: cat.count,
          totalPoints: cat.totalPoints
        })));
      }
      
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in GET /api/crayon-points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is officer/admin
    const player = await getPlayerById(session.user.id);
    if (!player?.isOfficer) {
      return NextResponse.json({ error: 'Unauthorized: Only officers can manage points' }, { status: 403 });
    }

    const data = await request.json();
    const operation = data.operation;
    
    if (!operation) {
      return NextResponse.json({ error: 'Operation is required' }, { status: 400 });
    }

    const crayonCollection = await getCrayonCollection();

    switch (operation) {
      case 'add': {
        // Validate required fields
        const validationError = validateRequiredFields(data, [
          'userId', 'username', 'points', 'category', 'reason'
        ]);
        
        if (validationError) {
          return NextResponse.json(validationError, { status: 400 });
        }
        
        // Validate points
        const points = parseInt(data.points);
        if (isNaN(points) || points <= 0) {
          return NextResponse.json({ error: 'Points must be a positive number' }, { status: 400 });
        }
        
        // Create transaction
        const transaction = {
          userId: data.userId,
          username: data.username,
          points,
          category: data.category,
          reason: data.reason,
          issuedBy: session.user.id,
          issuedByName: session.user.name,
          createdAt: new Date()
        };
        
        const result = await crayonCollection.insertOne(transaction);
        
        return NextResponse.json({
          success: true,
          transactionId: result.insertedId,
          transaction
        });
      }
      
      case 'remove': {
        // Validate required fields
        const validationError = validateRequiredFields(data, [
          'transactionId', 'reason'
        ]);
        
        if (validationError) {
          return NextResponse.json(validationError, { status: 400 });
        }
        
        // Find transaction
        const { transactionId } = data;
        const transaction = await crayonCollection.findOne({ 
          _id: transactionId,
          removed: { $ne: true }
        });
        
        if (!transaction) {
          return NextResponse.json({ error: 'Transaction not found or already removed' }, { status: 404 });
        }
        
        // Update transaction
        await crayonCollection.updateOne(
          { _id: transactionId },
          { 
            $set: {
              removed: true,
              removedBy: session.user.id,
              removedByName: session.user.name,
              removalReason: data.reason,
              removedAt: new Date()
            }
          }
        );
        
        return NextResponse.json({
          success: true,
          message: 'Transaction removed successfully'
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/crayon-points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 