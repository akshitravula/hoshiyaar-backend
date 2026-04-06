import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const moduleId = '68e276236d69ef07c1a2e133';
  const CurriculumItem = mongoose.connection.db.collection('curriculumitems');
  
  const items = await CurriculumItem.find({ moduleId: new mongoose.Types.ObjectId(moduleId) }).sort({ order: 1 }).toArray();
  
  console.log(`Found ${items.length} items for module ${moduleId}:`);
  items.forEach(it => {
    console.log(`- Order: ${it.order}, Type: ${it.type}, Images: ${it.images?.length || 0}, ImageUrl: ${it.imageUrl ? 'Yes' : 'No'}`);
  });

  if (items.length > 0) {
    console.log('\nSample Item (first):', JSON.stringify(items[0], null, 2));
  }

  await mongoose.disconnect();
};

check().catch(console.error);
