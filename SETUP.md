# Crayon Points System Setup

## Prerequisites
- Node.js 14+ and npm installed
- MongoDB Atlas account or a MongoDB server

## Setup Steps

1. Copy the example environment file to create your local environment file:
   ```
   cp .env.local.example .env.local
   ```

2. Add your MongoDB connection string to .env.local:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/raidteam
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser to http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/crayon-points/auth` - Authenticate a Discord user

### Points Management
- POST `/api/crayon-points/add` - Add points to a user
- POST `/api/crayon-points/remove` - Remove points from a user
- POST `/api/crayon-points/award` - Award points to a user

### Getting Data
- GET `/api/crayon-points/players` - Get all players
- GET `/api/crayon-points/leaderboard?period=season&category=all&limit=10` - Get leaderboard

## MongoDB Collections

The system uses two collections:
- `players` - Stores player information
- `crayons` - Stores point transactions 