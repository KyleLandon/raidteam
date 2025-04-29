import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { characterId, points, reason } = req.body;

    if (!characterId || !points || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("raidteam");
    const pointsCollection = db.collection("crayon_points");
    const historyCollection = db.collection("points_history");

    // Get current points
    const currentRecord = await pointsCollection.findOne({ characterId });
    const currentPoints = currentRecord ? currentRecord.points : 0;
    const newTotal = currentPoints + parseInt(points);

    // Update or insert points
    await pointsCollection.updateOne(
      { characterId },
      { 
        $set: { 
          points: newTotal,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    );

    // Log the transaction
    await historyCollection.insertOne({
      characterId,
      points: parseInt(points),
      reason,
      timestamp: new Date(),
      newTotal
    });

    res.status(200).json({ 
      message: 'Points updated successfully',
      newTotal
    });
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ message: 'Error updating points' });
  }
} 