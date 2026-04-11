import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const items = await CurriculumItem.find({type: 'comic'});
  console.log("COMICS:", items.map(i => ({id: i._id, type: i.type, text: i.text, images: i.images})));

  const stmts = await CurriculumItem.find({type: 'statement', text: /comic/});
  console.log("BROKEN STMTS:", stmts.map(i => ({id: i._id, type: i.type, text: i.text})));
  
  process.exit(0);
}
test();
