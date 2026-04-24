import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function removeEmptyModules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB. Searching for empty modules across all units...\n');

    const allModules = await Module.find({});
    console.log(`Found ${allModules.length} total modules in the database.`);

    let removedCount = 0;

    for (const module of allModules) {
      // Check if there are any CurriculumItems linked to this module
      const itemCount = await CurriculumItem.countDocuments({ moduleId: module._id });

      if (itemCount === 0) {
        console.log(`[EMPTY] Deleting Module: "${module.title}" (ID: ${module._id})`);
        await Module.deleteOne({ _id: module._id });
        removedCount++;
      }
    }

    console.log(`\nCleanup complete! Removed ${removedCount} empty/unnecessary module(s).`);

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

removeEmptyModules();
