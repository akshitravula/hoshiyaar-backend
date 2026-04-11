import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from './models/User.js';

config();

const manualUsers = [
  {
    username: 'admin',
    name: 'Administrator',
    age: 24,
    dateOfBirth: new Date('2000-01-01'),
    onboardingCompleted: true,
    board: 'CBSE',
    classLevel: '6',
    subject: 'Science',
    chapter: 'Temperature'
  },
  {
    username: 'ayush',
    name: 'Ayush',
    age: 28,
    dateOfBirth: new Date('1995-10-15'),
    onboardingCompleted: true
  },
  {
    username: 'student1',
    name: 'Happy Student',
    age: 10,
    dateOfBirth: new Date('2014-06-12'),
    onboardingCompleted: false
  }
];

const seedManualUsers = async () => {
  try {
    console.log('🌱 Starting manual user seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const userData of manualUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        console.log(`⚠️ User "${userData.username}" already exists. Skipping.`);
        continue;
      }
      
      await User.create(userData);
      console.log(`✅ User created: ${userData.username} (Login with DOB: ${userData.dateOfBirth.toISOString().split('T')[0]})`);
    }

    console.log('🎉 Manual user seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedManualUsers();
