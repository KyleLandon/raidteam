const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db("raidteam");

    // Create collections if they don't exist
    await db.createCollection("crayon_points");
    await db.createCollection("points_history");

    // Create indexes
    await db.collection("crayon_points").createIndex({ characterId: 1 }, { unique: true });
    await db.collection("points_history").createIndex({ characterId: 1 });
    await db.collection("points_history").createIndex({ timestamp: -1 });

    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Database initialized successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to initialize database' })
    };
  }
}; 