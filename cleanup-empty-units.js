import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Unit from './models/Unit.js';
import Module from './models/Module.js';

dotenv.config();

async function removeEmptyUnits() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB. Searching for empty units across all chapters...\n');

    const allUnits = await Unit.find({});
    console.log(`Found ${allUnits.length} total units in the database.`);

    let removedCount = 0;

    for (const unit of allUnits) {
      // Check if there are any modules linked to this unit
      const moduleCount = await Module.countDocuments({ unitId: unit._id });

      if (moduleCount === 0) {
        console.log(`[EMPTY] Deleting Unit: "${unit.title}" (ID: ${unit._id})`);
        await Unit.deleteOne({ _id: unit._id });
        removedCount++;
      }
    }

    console.log(`\nCleanup complete! Removed ${removedCount} empty/unnecessary unit(s).`);

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

removeEmptyUnits();
