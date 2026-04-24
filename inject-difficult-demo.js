import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  try {
    const chapter = await Chapter.findOne({ title: "Chapter 1: Measurement and motion" });
    if (!chapter) {
      console.log('❌ Chapter 1 not found. Aborting.');
      process.exit(1);
    }

    const unit = await Unit.findOne({ title: "Unit 1: Measurements and Measuring Tools", chapterId: chapter._id });
    if (!unit) {
      console.log('❌ Unit 1 not found. Aborting.');
      process.exit(1);
    }
    
    // Check if demo module already exists
    let demoModule = await Module.findOne({ title: "Difficult Module (Demo)", unitId: unit._id });
    if (demoModule) {
      console.log('🧹 Cleaning up old demo data...');
      await CurriculumItem.deleteMany({ moduleId: demoModule._id });
      await Module.deleteOne({ _id: demoModule._id });
    }

    console.log('📝 Creating Difficult Module...');
    // In original CSV, "Different Units" is order 3 and "Systems of Units" is order 4.
    // By giving order 3.5, it inserts exactly between them!
    demoModule = await Module.create({
      chapterId: chapter._id,
      unitId: unit._id,
      title: "Difficult Module (Demo)",
      order: 3.5,
      isDifficult: true
    });

    console.log('➕ Adding difficult questions...');
    await CurriculumItem.create([
      {
        moduleId: demoModule._id,
        order: 1,
        type: 'statement',
        text: 'Welcome to the Difficult Module! These questions were automatically scooped up from your earlier lessons because they were marked as "Y".'
      },
      {
        moduleId: demoModule._id,
        order: 2,
        type: 'multiple-choice',
        question: 'Demo Hard Question: Which of these is a derived unit that requires careful calculation?',
        options: ['Meter', 'Kilogram', 'Newton', 'Second'],
        answer: 'Newton'
      }
    ]);

    console.log('✅ Demo data successfully injected!');
    console.log('Refresh your dashboard to see the new Difficult Module right between "Different Units" and "Systems of Units"!');

  } catch (err) {
    console.error('❌ Error during demo injection:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
