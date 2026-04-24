import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function checkItem() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const id = '69d8dcff196175f4c1322105';
    const item = await CurriculumItem.findById(id);
    
    if (!item) {
      console.log(`Could not find item with ID: ${id}`);
    } else {
      console.log(`\nItem ID: ${item._id}`);
      console.log(`Type: ${item.type}`);
      console.log(`Question: ${item.question}`);
      console.log(`Options Array Length: ${item.options ? item.options.length : 0}`);
      console.log(`Options:`, item.options);
      console.log(`Words Array Length: ${item.words ? item.words.length : 0}`);
      console.log(`Words:`, item.words);
      console.log(`Answer:`, item.answer);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkItem();
