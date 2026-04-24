import mongoose from 'mongoose';
import Module from './models/Module.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const modules = await Module.find({
    title: { $in: [
      'Examples of Leaf Venation', 
      'Types of Roots', 
      /Leaf Venation/i,
      /Types of Roots/i
    ]}
  }).populate('chapterId').populate('unitId').sort({ order: 1 });
  
  console.log("Found modules:");
  for (const mod of modules) {
    console.log(`- ID: ${mod._id.toString()}, Title: '${mod.title}', Order: ${mod.order}, UnitId: ${mod.unitId?._id}, ChapterId: ${mod.chapterId?._id}`);
  }
  
  if (modules.length >= 2) {
      const allMods = await Module.find({ unitId: modules[0].unitId }).sort({ order: 1 });
      console.log("\nAll modules in this unit:");
      allMods.forEach(m => console.log(`  Order: ${m.order} | Title: '${m.title}'`));
  }
  process.exit(0);
}
run();
