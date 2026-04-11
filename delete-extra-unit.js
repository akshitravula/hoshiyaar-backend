import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from './models/Subject.js';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Find the Chapter
    const subject = await Subject.findOne({ name: 'Science' });
    if (!subject) {
      console.log('Subject "Science" not found');
      return;
    }

    const chapter = await Chapter.findOne({ 
      title: 'Chapter 2: Diversity in the Living World',
      subjectId: subject._id 
    });

    if (!chapter) {
      console.log('Chapter 2 not found');
      return;
    }

    console.log(`Cleaning up Chapter: ${chapter.title}`);

    // 2. Find and Delete Units named "Unit" (extra ones)
    const extraUnits = await Unit.find({ 
      chapterId: chapter._id,
      title: 'Unit' // Target the specific "Unit" label
    });

    if (extraUnits.length === 0) {
      console.log('No extra unit named "Unit" found.');
    }

    for (const unit of extraUnits) {
      console.log(`Deleting extra unit: "${unit.title}" (ID: ${unit._id})`);
      
      const modules = await Module.find({ unitId: unit._id });
      for (const m of modules) {
        console.log(`  - Deleting module: ${m.title}`);
        await CurriculumItem.deleteMany({ moduleId: m._id });
      }
      
      await Module.deleteMany({ unitId: unit._id });
      await Unit.deleteOne({ _id: unit._id });
    }

    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
