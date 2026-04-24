import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function checkRearrange() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find rearrange items that are NOT in the measurements unit
    // Let's just find the first 5 rearrange items randomly
    const items = await CurriculumItem.find({ type: 'rearrange' }).limit(10);
    
    console.log(`Found ${items.length} rearrange items overall.`);
    for (const item of items) {
      console.log(`\nQuestion: ${item.question}`);
      console.log(`Options:`, item.options);
      console.log(`Words:`, item.words);
      console.log(`Answer:`, item.answer);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkRearrange();
