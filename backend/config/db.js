const mongoose = require('mongoose');

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const db = await mongoose.connect(process.env.MONGODB_URI);
  isConnected = db.connections[0].readyState;
  console.log('MongoDB connected successfully');
};

module.exports = connectDatabase;
