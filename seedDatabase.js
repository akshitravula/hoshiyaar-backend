// Simple script to seed the database with basic data
import mongoose from 'mongoose';
import { config } from 'dotenv';
import Board from './models/Board.js';
import ClassLevel from './models/ClassLevel.js';
import Subject from './models/Subject.js';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';

// Load environment variables
config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoshiyaar');
    console.log('✅ Connected to MongoDB');
    
    // Create board
    const board = await Board.findOneAndUpdate(
      { name: 'CBSE' },
      { $setOnInsert: { name: 'CBSE' } },
      { upsert: true, new: true }
    );
    console.log('✅ Board created/found:', board.name);
    
    // Create class
    const classLevel = await ClassLevel.findOneAndUpdate(
      { boardId: board._id, name: '5' },
      { $setOnInsert: { boardId: board._id, name: '5', order: 5 } },
      { upsert: true, new: true }
    );
    console.log('✅ Class created/found:', classLevel.name);
    
    // Create subject
    const subject = await Subject.findOneAndUpdate(
      { boardId: board._id, classId: classLevel._id, name: 'Science' },
      { $setOnInsert: { boardId: board._id, classId: classLevel._id, name: 'Science' } },
      { upsert: true, new: true }
    );
    console.log('✅ Subject created/found:', subject.name);
    
    // Create chapter
    const chapter = await Chapter.findOneAndUpdate(
      { subjectId: subject._id, title: 'Temperature And Thermometer' },
      { $setOnInsert: { subjectId: subject._id, title: 'Temperature And Thermometer', order: 1 } },
      { upsert: true, new: true }
    );
    console.log('✅ Chapter created/found:', chapter.title);
    
    // Create unit
    const unit = await Unit.findOneAndUpdate(
      { chapterId: chapter._id, title: 'Unit 1' },
      { $setOnInsert: { chapterId: chapter._id, title: 'Unit 1', order: 1 } },
      { upsert: true, new: true }
    );
    console.log('✅ Unit created/found:', unit.title);
    
    // Create modules
    const modules = [
      { title: 'Introduction to Temperature', order: 1 },
      { title: 'What is a Thermometer?', order: 2 },
      { title: 'Types of Thermometers', order: 3 }
    ];
    
    const createdModules = [];
    for (const moduleData of modules) {
      const module = await Module.findOneAndUpdate(
        { chapterId: chapter._id, unitId: unit._id, title: moduleData.title },
        { $setOnInsert: { chapterId: chapter._id, unitId: unit._id, title: moduleData.title, order: moduleData.order } },
        { upsert: true, new: true }
      );
      createdModules.push(module);
    }
    console.log('✅ Created modules:', createdModules.length);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   Board: ${board.name}`);
    console.log(`   Class: ${classLevel.name}`);
    console.log(`   Subject: ${subject.name}`);
    console.log(`   Chapter: ${chapter.title}`);
    console.log(`   Unit: ${unit.title}`);
    console.log(`   Modules: ${createdModules.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding
seedDatabase();
