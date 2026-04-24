import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CurriculumItem from './models/CurriculumItem.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';

dotenv.config();

// Simple Fisher-Yates shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function fixEmptyRearrangeOptions() {
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

    let fixedCount = 0;

    for (const item of items) {
      // Check if options array is empty and we have a valid answer to derive options from
      if ((!item.options || item.options.length === 0) && item.answer) {
        
        // The answer is stored as comma separated e.g. "k,i,l,o"
        // Split it, shuffle it, and assign to options and words
        const elementsList = item.answer.split(',').map(s => s.trim()).filter(Boolean);
        
        if (elementsList.length > 0) {
          // Shuffle to ensure it's actually a rearrange question
          let shuffledOptions = shuffleArray(elementsList);
          
          // If by chance the shuffle is identical to the answer, swap first two items if len > 1
          if (shuffledOptions.join(',') === elementsList.join(',') && shuffledOptions.length > 1) {
            [shuffledOptions[0], shuffledOptions[1]] = [shuffledOptions[1], shuffledOptions[0]];
          }

          console.log(`Fixing item ID: ${item._id}`);
          console.log(` - Derived options from answer:`, elementsList);
          console.log(` - Shuffled to:`, shuffledOptions);

          await CurriculumItem.updateOne(
            { _id: item._id },
            { $set: { 
                options: shuffledOptions,
                words: shuffledOptions
              }
            }
          );
          
          fixedCount++;
        }
      }
    }

    console.log(`\nSuccessfully fixed ${fixedCount} rearrange items that had completely blank options!`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

fixEmptyRearrangeOptions();
