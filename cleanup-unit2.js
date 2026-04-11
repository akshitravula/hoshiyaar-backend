import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Unit from './models/Unit.js';
import Chapter from './models/Chapter.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const chapter = await Chapter.findOne({ title: 'Chapter 2: Diversity in the Living World' });
    if (!chapter) {
      console.log('Chapter 2 not found.');
      return;
    }

    // Delete "Unit 2" but NOT "Unit 1"
    const result = await Unit.deleteMany({ 
      title: 'Unit 2', 
      chapterId: chapter._id 
    });

    console.log(`Successfully deleted ${result.deletedCount} unnecessary Unit(s).`);
    
    // Diagnostic
    const remainingUnits = await Unit.find({ chapterId: chapter._id });
    console.log('Remaining units for Chapter 2:');
    remainingUnits.forEach(u => console.log(`- ${u.title} (ID: ${u._id})`));

  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
