import axios from 'axios';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const WOWAUDIT_API_KEY = process.env.WOWAUDIT_API_KEY;
    const MONGODB_URI = process.env.MONGODB_URI;

    console.log('Environment check:', {
      hasWowAuditKey: !!WOWAUDIT_API_KEY,
      hasMongoUri: !!MONGODB_URI,
      nodeEnv: process.env.NODE_ENV
    });

    if (!WOWAUDIT_API_KEY) {
      throw new Error('WoWAudit API key is missing');
    }

    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is missing');
    }

    // Test MongoDB connection
    let client;
    try {
      console.log('Attempting MongoDB connection...');
      client = await clientPromise;
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      throw new Error('Failed to connect to MongoDB');
    }

    // Get characters from WoWAudit API
    console.log('Fetching characters from WoWAudit...');
    const response = await axios.get('https://wowaudit.com/api/characters', {
      headers: {
        'Authorization': `Bearer ${WOWAUDIT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('WoWAudit response received:', {
      status: response.status,
      dataLength: response.data?.length || 0
    });

    // Get points from MongoDB
    const db = client.db("raidteam");
    const pointsCollection = db.collection("crayon_points");
    const pointsRecords = await pointsCollection.find({}).toArray();
    
    console.log('Points records retrieved:', {
      count: pointsRecords.length
    });

    const pointsMap = pointsRecords.reduce((acc, record) => {
      acc[record.characterId] = record.points;
      return acc;
    }, {});

    // Map the response data
    const characters = response.data.map(character => ({
      id: character.id,
      name: character.name,
      realm: character.realm,
      class: character.class,
      spec: character.spec,
      crayons: pointsMap[character.id] || 0
    }));

    console.log('Sending response with characters:', {
      count: characters.length
    });

    res.status(200).json(characters);
  } catch (error) {
    console.error('Error in /api/characters:', error);

    // Detailed error logging
    if (error.response) {
      console.error('API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('No response received:', {
        request: error.request
      });
    }

    // Send appropriate error response
    res.status(500).json({
      message: 'Error fetching characters',
      error: error.message,
      type: error.response ? 'API_ERROR' : error.request ? 'REQUEST_ERROR' : 'SERVER_ERROR'
    });
  }
} 