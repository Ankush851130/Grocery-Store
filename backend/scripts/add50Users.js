const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/user.model');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in backend/.env file');
  process.exit(1);
}

async function seedFiftyUsers() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected successfully.');

    // Clean up any previously generated test users to prevent duplicate key errors
    console.log('Cleaning up existing test users (testuser1 to testuser50)...');
    const deleteResult = await User.deleteMany({ email: { $regex: /^testuser\d+@example\.com$/ } });
    console.log(`Deleted ${deleteResult.deletedCount} existing test users.`);

    console.log('Generating 50 test users...');
    const usersToCreate = [];
    const password = 'Password@123'; // Default password for all test users

    for (let i = 1; i <= 50; i++) {
      usersToCreate.push({
        name: `Test User ${i}`,
        email: `testuser${i}@example.com`,
        password: password,
        phone: `+91 99999000${String(i).padStart(2, '0')}`,
        role: 'user',
        isEmailVerified: true,
      });
    }

    console.log('Inserting 50 users into database (this will automatically hash passwords)...');
    // Using User.create will trigger the pre-save hook for password hashing in user.model.js
    const createdUsers = await User.create(usersToCreate);
    
    console.log(`Successfully created ${createdUsers.length} users!`);
    console.log('\nSample logins generated:');
    console.log(`- Email: testuser1@example.com / Password: ${password}`);
    console.log(`- Email: testuser50@example.com / Password: ${password}`);
    console.log('\n--- DONE ---');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding 50 users:', error);
    process.exit(1);
  }
}

seedFiftyUsers();
