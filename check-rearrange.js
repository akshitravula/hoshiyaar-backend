import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CurriculumItem from './models/CurriculumItem.js';
import Module from './models/Module.js';
import Unit from './models/Unit.js';

dotenv.config();

async function checkRearrange() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Find a unit related to measurement first
    const unit = await Unit.findOne({ title: { $regex: new RegExp('measurement', 'i') } });
    if (!unit) {
      console.log('Unit not found');
      return;
    }
    const modules = await Module.find({ unitId: unit._id });
    const moduleIds = modules.map(m => m._id);

    console.log(`Checking rearrange items in ${modules.length} modules...`);

    const items = await CurriculumItem.find({
      moduleId: { $in: moduleIds },
      type: 'rearrange'
    });

    console.log(`Found ${items.length} rearrange items in this unit.`);
    for (const item of items) {
      console.log(`\nItem ID: ${item._id}`);
      console.log(`Question: ${item.question}`);
      console.log(`Options Array Length: ${item.options ? item.options.length : 0}`);
      console.log(`Options:`, item.options);
      console.log(`Words Array Length: ${item.words ? item.words.length : 0}`);
      console.log(`Words:`, item.words);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

checkRearrange();
