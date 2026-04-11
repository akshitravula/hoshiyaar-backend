import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import Chapter from './models/Chapter.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const chapterId = '69d8dcff196175f4c1322ff'; // From diag-units.js output

  const unitsToDelete = [
    '69d8dd1a196175f4c1322b9b', // Unit 0
    '69d8dd1a196175f4c1322bf1', // Unit 2 (empty)
    '69d8dd20196175f4c1322e24'  // Unit 3
  ];

  console.log(`Cleaning up ${unitsToDelete.length} extra units...`);

  for (const id of unitsToDelete) {
    // Double check module count before deleting
    const moduleCount = await Module.countDocuments({ unitId: id });
    if (moduleCount === 0) {
      await Unit.deleteOne({ _id: id });
      console.log(`Deleted Unit with ID: ${id}`);
    } else {
      console.log(`Skipping Unit with ID: ${id} because it has ${moduleCount} modules.`);
    }
  }

  console.log('Cleanup complete!');
  await mongoose.disconnect();
}
run();
