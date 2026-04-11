import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  let output = 'Hierarchy:\n';
  const chapters = await Chapter.find({ title: 'Chapter 2: Diversity in the Living World' });

  for (const chapter of chapters) {
    const units = await Unit.find({ chapterId: chapter._id }).sort({ order: 1 });
    for (const unit of units) {
      output += `Unit: ${unit.title} (${unit._id})\n`;
      const modules = await Module.find({ unitId: unit._id }).sort({ order: 1 });
      for (const mod of modules) {
        output += `  Module: ${mod.title}\n`;
      }
    }
  }

  fs.writeFileSync('hierarchy-output.txt', output);
  await mongoose.disconnect();
}

run();
