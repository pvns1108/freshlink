import mongoose from "mongoose";

/**
 * connectDB
 *
 * Connection strategy (hackathon-friendly, zero-config):
 *  1. If MONGO_URI is set in .env -> connect to that (local Mongo or Atlas).
 *  2. If not set -> auto-launch an in-memory MongoDB instance using
 *     mongodb-memory-server, so the app works with just `npm install && npm run dev`.
 *  3. If connection fails for any reason -> DO NOT crash the server.
 *     Log a clear warning and keep Express running. Routes that need the DB
 *     will return a friendly 503 "database unavailable" response instead of
 *     bringing the whole API down (see middleware/errorHandler.js).
 *
 * This satisfies the hackathon requirement: "Do not allow the application
 * to crash if MongoDB is unavailable."
 */

let memoryServer = null;

export const getDbStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  usingInMemory: !!memoryServer,
});

const connectDB = async () => {
  const configuredUri = process.env.MONGO_URI && process.env.MONGO_URI.trim();

  try {
    if (configuredUri) {
      await mongoose.connect(configuredUri);
      console.log(`[db] Connected to MongoDB at ${maskUri(configuredUri)}`);
      return;
    }

    // No URI provided — try to spin up an ephemeral in-memory MongoDB.
    console.log("[db] No MONGO_URI set — starting an in-memory MongoDB instance...");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log("[db] Connected to in-memory MongoDB (data resets on restart).");
    console.log("[db] Tip: set MONGO_URI in server/.env to persist data across restarts.");
  } catch (err) {
    console.warn("[db] Could not connect to MongoDB:", err.message);
    console.warn(
      "[db] The server will keep running, but database-backed routes will respond with 503 until a database is available."
    );
    console.warn(
      "[db] Fix: set MONGO_URI in your .env to a reachable MongoDB instance (local mongod or a free MongoDB Atlas cluster)."
    );
  }
};

const maskUri = (uri) => uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");

export default connectDB;
