const mongoose = require('mongoose');

const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log('MongoDB connected successfully');
};

module.exports = connectDatabase;
