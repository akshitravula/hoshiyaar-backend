import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const chapterTitle = 'Chapter 1: Measurement and motion';
  const targetChapter = await Chapter.findOne({ title: chapterTitle });

  if (!targetChapter) {
    console.log(`❌ Chapter "${chapterTitle}" not found!`);
    process.exit(1);
  }

  // Find ALL units in this chapter
  const allUnits = await Unit.find({ chapterId: targetChapter._id });
  console.log(`\nFound ${allUnits.length} total units inside "${chapterTitle}".`);

  // The only two perfect units we want to keep
  const validUnitTitles = [
    'Unit 1: Measurements and Measuring Tools',
    'Unit 2: Motion Around Us'
  ];

  let deletedCount = 0;

  for (const unit of allUnits) {
    if (!validUnitTitles.includes(unit.title) || unit._id.toString() === '69e899403189e8d381d0ac4a') {
      console.log(`\n🗑️ Deleting useless unit: "${unit.title}" (ID: ${unit._id})`);

      const modules = await Module.find({ unitId: unit._id });
      const moduleIds = modules.map(m => m._id);

      if (moduleIds.length > 0) {
        const itemResult = await CurriculumItem.deleteMany({ moduleId: { $in: moduleIds } });
        console.log(`  → Deleted ${itemResult.deletedCount} CurriculumItem(s)`);
        
        const modResult = await Module.deleteMany({ unitId: unit._id });
        console.log(`  → Deleted ${modResult.deletedCount} Module(s)`);
      }

      await Unit.deleteOne({ _id: unit._id });
      console.log(`  → Deleted Unit`);
      deletedCount++;
    } else {
        console.log(`\n✅ Keeping valid unit: "${unit.title}"`);
    }
  }

  console.log(`\n🎉 Success! Purged ${deletedCount} useless unit(s).`);
  await mongoose.disconnect();
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
