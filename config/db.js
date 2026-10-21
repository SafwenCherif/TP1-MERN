const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is missing from the .env configuration.');
  }

  await mongoose.connect(uri, { autoIndex: true });
  console.log('MongoDB connection established successfully.');
}

module.exports = connectDB;
