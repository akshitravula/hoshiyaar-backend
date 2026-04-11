import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const chapters = await Chapter.find({ title: 'Chapter 2: Diversity in the Living World' });
  const chapterIds = chapters.map(c => c._id);

  const units = await Unit.find({ chapterId: { $in: chapterIds } }).sort({ order: 1 });
  for (const unit of units) {
    console.log(`\nUnit: ${unit.title} (${unit._id})`);
    const modules = await Module.find({ unitId: unit._id }).sort({ order: 1 });
    for (const mod of modules) {
      const items = await CurriculumItem.countDocuments({ moduleId: mod._id });
      console.log(`  Module: ${mod.title} (${mod._id}) - ${items} items`);
    }
  }

  await mongoose.disconnect();
}
run();
