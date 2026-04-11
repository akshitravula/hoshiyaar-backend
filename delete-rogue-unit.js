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

  // Find the rogue unit
  const rogueUnits = await Unit.find({
    title: { $regex: 'Bio means water', $options: 'i' }
  });

  if (rogueUnits.length === 0) {
    console.log("✅ No rogue units found.");
  } else {
    for (const unit of rogueUnits) {
      console.log(`🗑️  Found rogue unit: "${unit.title}"`);
      
      const modules = await Module.find({ unitId: unit._id });
      for (const mod of modules) {
        console.log(`   → Deleting module: "${mod.title}"`);
        const itemResult = await CurriculumItem.deleteMany({ moduleId: mod._id });
        console.log(`     → Deleted ${itemResult.deletedCount} CurriculumItem(s)`);
      }
      
      await Module.deleteMany({ unitId: unit._id });
      await Unit.deleteOne({ _id: unit._id });
      console.log(`   → Deleted the Unit successfully.`);
    }
  }

  await mongoose.disconnect();
}

run();
