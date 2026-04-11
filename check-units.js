import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from './models/Subject.js';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const chapter = await Chapter.findOne({ title: 'Chapter 1: Measurement and motion' });
  if (!chapter) {
    console.log('Chapter not found');
    await mongoose.disconnect();
    return;
  }

  const units = await Unit.find({ chapterId: chapter._id });
  console.log(`Units for ${chapter.title}:`);
  units.forEach(u => console.log(`- ${u.title} (ID: ${u._id})`));

  await mongoose.disconnect();
}
run();
