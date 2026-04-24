import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from './models/Module.js';
import Unit from './models/Unit.js';

dotenv.config();

const desiredOrder = [
  "Physical Quantities and Measurement: Intro",
  "Physical Quantities and Measurement: Key units part 1",
  "Physical Quantities and Measurement: Key units part 2",
  "Different Units",
  "Systems of Units",
  "Standard Units and SI Units",
  "Unit Conversion part 1",
  "Unit Conversion part 2",
  "Informal Units of Measurement",
  "Measuring Length with Standard Tools",
  "Other measuring techniques"
];

async function updateOrder() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Find any unit that contains "Measurement" or "Motion"
    const units = await Unit.find({ title: { $regex: new RegExp('measurement', 'i') } });
    
    if (units.length === 0) {
      console.log('Could not find ANY unit containing "Measurement"');
      const allUnits = await Unit.find().limit(20);
      console.log('Here are some units currently in the DB:');
      allUnits.forEach(u => console.log(` - ${u.title}`));
      return;
    }

    console.log(`Found ${units.length} unit(s) containing "Measurement":`);
    units.forEach(u => console.log(` - [${u._id}] ${u.title}`));

    const targetUnit = units[0]; // Let's just pick the first one and proceed
    console.log(`\nProceeding to update modules for unit: "${targetUnit.title}"\n`);

    const modules = await Module.find({ unitId: targetUnit._id });
    console.log(`Found ${modules.length} modules for this unit`);

    let updatedCount = 0;
    for (let c = 0; c < desiredOrder.length; c++) {
      const orderName = desiredOrder[c].trim();
      const newOrder = c + 1;
      
      const mod = modules.find(m => m.title.trim().toLowerCase() === orderName.toLowerCase());
      if (mod) {
        await Module.updateOne({ _id: mod._id }, { $set: { order: newOrder } });
        console.log(`Updated [${mod.title}] -> order: ${newOrder}`);
        updatedCount++;
      } else {
         console.log(`WARNING: Could not find module matching [${orderName}]`);
      }
    }

    console.log(`\nSuccessfully updated ${updatedCount} modules out of ${desiredOrder.length}.`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

updateOrder();
