import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function mergeModules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const title1 = "Physical Quantities and Measurement: Key units part 1";
    const title2 = "Physical Quantities and Measurement: Key units part 2";
    const newTitle = "Physical Quantities and Measurement";

    // 1. Find the two modules
    const mod1 = await Module.findOne({ title: title1 });
    const mod2 = await Module.findOne({ title: title2 });

    if (!mod1 && !mod2) {
      console.log('Neither Module 1 nor Module 2 was found. They might have already been merged!');
      return;
    }

    if (mod1 && mod2) {
      console.log(`Found both modules. Merging Part 2 into Part 1...`);

      // 2. We need to ensure the sequence makes sense. 
      // Get all items in Mod 1 to find the highest order number
      const mod1Items = await CurriculumItem.find({ moduleId: mod1._id }).sort({ order: -1 }).limit(1);
      let maxOrder = mod1Items.length > 0 ? mod1Items[0].order : 0;

      // Get all items in Mod 2 sorted by their current order
      const mod2Items = await CurriculumItem.find({ moduleId: mod2._id }).sort({ order: 1 });
      console.log(`To move: ${mod2Items.length} items from Part 2`);

      // Move items and update their order
      for (const item of mod2Items) {
        maxOrder += 1;
        await CurriculumItem.updateOne(
          { _id: item._id },
          { $set: { moduleId: mod1._id, order: maxOrder } }
        );
      }

      // Rename Mod 1
      await Module.updateOne(
        { _id: mod1._id },
        { $set: { title: newTitle } }
      );
      console.log(`Renamed Part 1 to: "${newTitle}"`);

      // Delete the empty Mod 2
      await Module.deleteOne({ _id: mod2._id });
      console.log(`Deleted empty Part 2 module.`);

    } else if (mod1 && !mod2) {
      console.log(`Part 2 not found! Assuming it was already merged. Renaming Part 1...`);
      await Module.updateOne(
        { _id: mod1._id },
        { $set: { title: newTitle } }
      );
      console.log(`Renamed Part 1 to: "${newTitle}"`);
    } else if (!mod1 && mod2) {
      console.log(`Part 1 not found! Assuming it was already deleted. Renaming Part 2...`);
      await Module.updateOne(
        { _id: mod2._id },
        { $set: { title: newTitle } }
      );
      console.log(`Renamed Part 2 to: "${newTitle}"`);
    }

    console.log(`\nMerge operation completed successfully!`);

  } catch (error) {
    console.error('Error during merge:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

mergeModules();
