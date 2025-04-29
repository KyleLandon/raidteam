import axios from 'axios';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const WOWAUDIT_API_KEY = process.env.WOWAUDIT_API_KEY;

    if (!WOWAUDIT_API_KEY) {
      return res.status(500).json({ message: 'API configuration missing' });
    }

    console.log('Attempting to fetch characters from WoWAudit...');
    
    // Get characters from WoWAudit API
    const response = await axios.get(`https://wowaudit.com/api/characters`, {
      headers: {
        'Authorization': `Bearer ${WOWAUDIT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('WoWAudit API Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("raidteam");
    const pointsCollection = db.collection("crayon_points");

    // Get all points records
    const pointsRecords = await pointsCollection.find({}).toArray();
    const pointsMap = pointsRecords.reduce((acc, record) => {
      acc[record.characterId] = record.points;
      return acc;
    }, {});

    // Map the response data and include crayon points from MongoDB
    const characters = response.data.map(character => ({
      id: character.id,
      name: character.name,
      realm: character.realm,
      class: character.class,
      spec: character.spec,
      crayons: pointsMap[character.id] || 0
    }));

    res.status(200).json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    if (error.response) {
      console.error('WoWAudit API Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    res.status(500).json({ 
      message: 'Error fetching characters',
      error: error.response?.data || error.message
    });
  }
} 