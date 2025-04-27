const { MongoClient } = require('mongodb');

// Setup MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { discordId } = data;

    if (!discordId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Discord ID is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db('raidteam');
    const players = db.collection('players');

    // Check if the player exists
    const existingPlayer = await players.findOne({ discordId });
    
    if (existingPlayer) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          player: existingPlayer 
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Player doesn't exist, create a new one
    const { username, avatar, isOfficer = false } = data;
    
    if (!username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username is required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const newPlayer = {
      discordId,
      username,
      avatar,
      isOfficer,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await players.insertOne(newPlayer);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        player: newPlayer,
        isNew: true
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error in discord-auth function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}; 