import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function fixRearrangeWords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Find all 'rearrange' items
    const items = await CurriculumItem.find({ type: 'rearrange' });
    console.log(`Found ${items.length} total rearrange items in the database.`);

    let updatedCount = 0;

    for (const item of items) {
      if (!item.words || item.words.length === 0 || item.words.length !== item.options.length) {
        
        let shouldUpdate = false;
        let newOptions = item.options;

        // Optionally, if the user meant that options should just be the literal strings joined by commas,
        // we can check if it looks like character soup, but right now standard is an array of substrings.
        
        // Fix: Simply set words = options like the standard import script does.
        await CurriculumItem.updateOne(
          { _id: item._id },
          { $set: { words: newOptions } }
        );

        updatedCount++;
      }
    }

    console.log(`Successfully fixed ${updatedCount} rearrange items by setting their 'words' array!`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

fixRearrangeWords();
