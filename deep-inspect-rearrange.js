import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CurriculumItem from './models/CurriculumItem.js';
import Module from './models/Module.js';
import Unit from './models/Unit.js';

dotenv.config();

async function inspectRearrange() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const unit = await Unit.findOne({ title: { $regex: new RegExp('measurement', 'i') } });
    if (!unit) {
      console.log('Unit Measurements and Motion not found!');
      return;
    }

    const modules = await Module.find({ unitId: unit._id });
    const moduleIds = modules.map(m => m._id);

    const items = await CurriculumItem.find({
      moduleId: { $in: moduleIds },
      type: 'rearrange'
    });

    console.log(`\nFound ${items.length} rearrange items in Measurements and Motion unit.\n`);
    
    for (const item of items) {
      console.log(`--- Item ID: ${item._id} ---`);
      console.log(`Question: ${item.question}`);
      console.log(`Answer: ${item.answer}`);
      console.log(`Text: ${item.text}`);
      console.log(`Options (${Array.isArray(item.options) ? item.options.length : 'NaN'}):`, item.options);
      console.log(`Words (${Array.isArray(item.words) ? item.words.length : 'NaN'}):`, item.words);
      console.log(`\n`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

inspectRearrange();
