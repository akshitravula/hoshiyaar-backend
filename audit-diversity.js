import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function audit() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const chapter = await Chapter.findOne({ title: /Diversity/i });
  if (!chapter) {
    console.log("Chapter not found!");
    await mongoose.disconnect();
    return;
  }
  console.log(`Auditing Chapter: "${chapter.title}" (ID: ${chapter._id})`);

  const units = await Unit.find({ chapterId: chapter._id });
  console.log(`Units found: ${units.length}`);

  for (const unit of units) {
    console.log(`\nUnit: "${unit.title}"`);
    const modules = await Module.find({ unitId: unit._id });
    console.log(`  Modules: ${modules.length}`);
    for (const mod of modules) {
      const itemCount = await CurriculumItem.countDocuments({ moduleId: mod._id });
      console.log(`    - Module: "${mod.title}" -> ${itemCount} items`);
    }
  }

  const totalItemsInChapter = await CurriculumItem.countDocuments({
    moduleId: { $in: (await Module.find({ chapterId: chapter._id })).map(m => m._id) }
  });
  console.log(`\nTotal items in this chapter: ${totalItemsInChapter}`);

  await mongoose.disconnect();
}

audit().catch(console.error);
