import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';

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
  console.log(`Units for ${chapter.title} (ID: ${chapter._id}):`);
  for (const u of units) {
    const modules = await Module.find({ unitId: u._id });
    console.log(`- ${u.title} (ID: ${u._id}) [${modules.length} modules]`);
  }

  await mongoose.disconnect();
}
run();
