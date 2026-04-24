import mongoose from 'mongoose';
import CurriculumItem from './models/CurriculumItem.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const items = await CurriculumItem.find({ type: 'statement' }).sort({ createdAt: -1 }).limit(5);
  for (const item of items) {
    console.log(`ID: ${item._id}, Type: ${item.type}, Question: ${item.question}, Text: ${item.text}, Keywords: ${item.keywords}`);
  }
  process.exit();
}
run();
