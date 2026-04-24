import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const unitTitlesToDelete = ['Unit 0'];

  console.log(`\n🗑️ Searching for Units: ${unitTitlesToDelete.join(', ')} ...\n`);
  
  const units = await Unit.find({ title: { $in: unitTitlesToDelete } });
  
  for (const unit of units) {
    console.log(`  Deleting Unit: "${unit.title}" (ID: ${unit._id})`);
    
    const modules = await Module.find({ unitId: unit._id });
    const moduleIds = modules.map(m => m._id);
    
    if (moduleIds.length > 0) {
        const itemResult = await CurriculumItem.deleteMany({ moduleId: { $in: moduleIds } });
        console.log(`  → Deleted ${itemResult.deletedCount} CurriculumItem(s)`);
        
        const modResult = await Module.deleteMany({ unitId: unit._id });
        console.log(`  → Deleted ${modResult.deletedCount} Module(s)`);
    } else {
        console.log(`  → No Modules found inside this unit.`);
    }
    
    await Unit.deleteOne({ _id: unit._id });
    console.log(`  → Deleted Unit`);
  }

  console.log('\n✅ Deletion complete.\n');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
