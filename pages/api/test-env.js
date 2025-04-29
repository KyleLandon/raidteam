export default async function handler(req, res) {
  const envStatus = {
    wowaudit: process.env.WOWAUDIT_API_KEY ? 'configured' : 'missing',
    mongodb: process.env.MONGODB_URI ? 'configured' : 'missing',
    node_env: process.env.NODE_ENV || 'not set'
  };

  res.status(200).json(envStatus);
}

 