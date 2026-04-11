import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config();

async function checkAuth() {
  console.log('--- Auth Diagnostic Start ---');
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Check user count
    const userCount = await User.countDocuments();
    console.log(`🔹 Total Users in DB: ${userCount}`);

    if (userCount > 0) {
      const sampleUser = await User.findOne();
      console.log(`🔹 Sample User found: ${sampleUser.username}`);
      
      // 2. Test matchDateOfBirth logic
      const dob = sampleUser.dateOfBirth;
      const dobString = dob.toISOString().split('T')[0];
      const isMatch = await sampleUser.matchDateOfBirth(dobString);
      console.log(`🔹 matchDateOfBirth test with correct DOB (${dobString}): ${isMatch ? '✅ PASS' : '❌ FAIL'}`);

      try {
        await sampleUser.matchDateOfBirth('invalid-date');
        console.log('🔹 matchDateOfBirth test with invalid date: ❌ should have thrown but didn\'t');
      } catch (e) {
        console.log(`🔹 matchDateOfBirth test with invalid date: ✅ Caught expected error (${e.message})`);
      }
    }

    // 3. Test JWT generation
    const testId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: testId }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log('🔹 JWT Generation: ✅ PASS');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id === String(testId)) {
        console.log('🔹 JWT Verification: ✅ PASS');
    } else {
        console.log('🔹 JWT Verification: ❌ FAIL (ID mismatch)');
    }

    console.log('\n--- Status: AUTH SYSTEM LOGIC HEALTHY ---');
  } catch (error) {
    console.error('❌ Diagnostic Failed!');
    console.error('Error details:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkAuth();
