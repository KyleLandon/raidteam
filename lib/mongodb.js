import { MongoClient, ServerApiVersion } from 'mongodb';

// Use environment variable for MongoDB URI
const uri = process.env.MONGODB_URI || "mongodb+srv://kylepotteiger:@Kylep604@raid-team.s7jfu.mongodb.net/raid-team?retryWrites=true&w=majority&appName=raid-team";

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local or Netlify environment variables');
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useUnifiedTopology: true,
  useNewUrlParser: true,
  connectTimeoutMS: 10000,
  retryWrites: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
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