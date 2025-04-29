import clientPromise from '../lib/mongodb';

async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db("raidteam");

    // Create collections if they don't exist
    console.log('Creating collections...');
    await db.createCollection("characters");
    await db.createCollection("points_history");

    // Create indexes for characters collection
    console.log('Creating indexes...');
    await db.collection("characters").createIndex({ id: 1 }, { unique: true });
    await db.collection("characters").createIndex({ name: 1 });
    await db.collection("characters").createIndex({ realm: 1 });
    await db.collection("characters").createIndex({ class: 1 });
    await db.collection("characters").createIndex({ role: 1 });
    await db.collection("characters").createIndex({ rank: 1 });
    await db.collection("characters").createIndex({ status: 1 });
    await db.collection("characters").createIndex({ blizzard_id: 1 });
    await db.collection("characters").createIndex({ lastSynced: -1 });

    // Create indexes for points history
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