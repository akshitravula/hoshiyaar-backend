import mongoose from 'mongoose';
import Module from './models/Module.js';
import dotenv from 'dotenv';
dotenv.config();

async function removeTestModule() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    // Find and delete the module with title strictly 'Test'
    const result = await Module.deleteOne({ title: 'Test' });

    if (result.deletedCount > 0) {
      console.log(`Successfully removed the "Test" module!`);
    } else {
      console.log(`Could not find a module named "Test" to remove.`);
    }
  } catch (err) {
    console.error("Error removing module:", err);
  } finally {
    process.exit(0);
  }
}

removeTestModule();
