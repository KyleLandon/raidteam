import { MongoClient, ServerApiVersion } from 'mongodb';

// Get MongoDB URI from environment variable
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not defined in environment variables');
  throw new Error('Please add your Mongo URI to Netlify environment variables');
}

// Validate URI format
if (!uri.includes('mongodb+srv://') || !uri.includes('.mongodb.net')) {
  console.error('Invalid MongoDB URI format:', uri);
  throw new Error('Invalid MongoDB URI format. Please check your environment variables.');
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then(() => {
        console.log('Successfully connected to MongoDB');
        return client;
      })
      .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(() => {
      console.log('Successfully connected to MongoDB');
      return client;
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      throw err;
    });
}

// Export a module-scoped MongoClient promise
export default clientPromise; 