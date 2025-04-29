import clientPromise from '../lib/mongodb';

async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db("raidteam");

    // Create collections if they don't exist
    console.log('Creating collections...');
    await db.createCollection("crayon_points");
    await db.createCollection("points_history");

    // Create indexes
    console.log('Creating indexes...');
    await db.collection("crayon_points").createIndex({ characterId: 1 }, { unique: true });
    await db.collection("points_history").createIndex({ characterId: 1 });
    await db.collection("points_history").createIndex({ timestamp: -1 });

    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 