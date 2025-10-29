import mongoose from 'mongoose';
import Subject from './models/Subject.js';
import Chapter from './models/Chapter.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hoshiyaar');
    console.log('Connected to MongoDB');
    
    // Check all subjects
    const subjects = await Subject.find({}).populate('boardId classId');
    console.log('\n=== SUBJECTS ===');
    subjects.forEach(s => {
      console.log(`Subject: ${s.name}, Board: ${s.boardId?.name}, Class: ${s.classId?.name}`);
    });
    
    // Check all chapters
    const chapters = await Chapter.find({}).populate('subjectId');
    console.log('\n=== CHAPTERS ===');
    chapters.forEach(c => {
      console.log(`Chapter: ${c.title}, Subject: ${c.subjectId?.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();