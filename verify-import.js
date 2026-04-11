import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Board from './models/Board.js';
import ClassLevel from './models/ClassLevel.js';
import Subject from './models/Subject.js';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const boards = await Board.countDocuments();
  const classes = await ClassLevel.countDocuments();
  const subjects = await Subject.countDocuments();
  const chapters = await Chapter.countDocuments();
  const units = await Unit.countDocuments();
  const modules = await Module.countDocuments();
  const items = await CurriculumItem.countDocuments();

  console.log('--- Verification Report ---');
  console.log(`Boards: ${boards}`);
  console.log(`Classes: ${classes}`);
  console.log(`Subjects: ${subjects}`);
  console.log(`Chapters: ${chapters}`);
  console.log(`Units: ${units}`);
  console.log(`Modules: ${modules}`);
  console.log(`Curriculum Items: ${items}`);

  // Sample items for the specific chapter
  const samples = await CurriculumItem.find().sort({ createdAt: -1 }).limit(5);
  console.log('\n--- Recent Items Sample ---');
  samples.forEach(item => {
    console.log(`- Type: ${item.type}, Module ID: ${item.moduleId}, Text/Q: ${item.text || item.question}`);
  });

  await mongoose.disconnect();
}

verify().catch(console.error);
