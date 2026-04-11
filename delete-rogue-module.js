import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Let's search across all modules with "Bio means water" in the title or similar
  const rogueModules = await Module.find({
    title: { $regex: 'Bio means water', $options: 'i' }
  });

  if (rogueModules.length === 0) {
    console.log("No rogue modules found containing 'Bio means water'");
  } else {
    for (const mod of rogueModules) {
      console.log(`🗑️  Found rogue module: "${mod.title}" (ID: ${mod._id})`);
      
      // Delete all curriculum items associated with this module
      const itemResult = await CurriculumItem.deleteMany({ moduleId: mod._id });
      console.log(`   → Deleted ${itemResult.deletedCount} CurriculumItem(s)`);
      
      // Delete the module itself
      await Module.deleteOne({ _id: mod._id });
      console.log(`   → Deleted the module.`);
    }
  }

  // Also catch "Bio means life" just in case it's a separate module
  const rogueModules2 = await Module.find({
    title: { $regex: 'Bio means life', $options: 'i' }
  });

  if (rogueModules2.length > 0) {
    for (const mod of rogueModules2) {
      console.log(`🗑️  Found rogue module: "${mod.title}" (ID: ${mod._id})`);
      
      const itemResult = await CurriculumItem.deleteMany({ moduleId: mod._id });
      console.log(`   → Deleted ${itemResult.deletedCount} CurriculumItem(s)`);
      
      await Module.deleteOne({ _id: mod._id });
      console.log(`   → Deleted the module.`);
    }
  }

  // Also list ALL modules under Chapter 2 to see if there are any other weird ones
  console.log('\n--- Current Modules in Chapter 2 ---');
  const chapters = await Chapter.find({ title: 'Chapter 2: Diversity in the Living World' });
  for (const cap of chapters) {
    const units = await Unit.find({ chapterId: cap._id }).sort({ order: 1 });
    for (const unit of units) {
      const modules = await Module.find({ unitId: unit._id }).sort({ order: 1 });
      for (const mod of modules) {
        console.log(`[Unit: ${unit.title}] Module: ${mod.title}`);
      }
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
