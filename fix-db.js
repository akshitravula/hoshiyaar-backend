import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function fixDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const statements = await CurriculumItem.find({ type: 'statement' });
  let fixed = 0;
  for (const item of statements) {
    if (item.text && item.text.includes('"type":"comic"')) {
      try {
        const parsed = JSON.parse(item.text);
        if (parsed.type === 'comic') {
          item.type = 'comic';
          item.text = undefined;
          if (parsed.imageUrl) item.imageUrl = parsed.imageUrl;
          if (parsed.images && parsed.images.length > 0) item.images = parsed.images;
          await item.save();
          fixed++;
          console.log(`Fixed item ${item._id}`);
        }
      } catch (e) {
        // Not a JSON string, ignore
      }
    }
  }

  console.log(`Fixed ${fixed} items in the database.`);
  process.exit(0);
}

fixDB().catch(console.error);
