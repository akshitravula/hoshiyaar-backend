import mongoose from 'mongoose';
import Module from './models/Module.js';
import dotenv from 'dotenv';
dotenv.config();

async function addTestModule() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const mod1 = await Module.findOne({ title: { $regex: /Examples of Leaf Venation/i } });
    const mod2 = await Module.findOne({ title: { $regex: /Types of Roots/i } });

    if (!mod1 || !mod2) {
      console.log("Could not find one or both of the reference modules.");
      if (!mod1) console.log("Missing: Examples of Leaf Venation");
      if (!mod2) console.log("Missing: Types of Roots");
      process.exit(1);
    }

    console.log(`Found "${mod1.title}" (Order: ${mod1.order})`);
    console.log(`Found "${mod2.title}" (Order: ${mod2.order})`);

    // Calculate halfway point
    const newOrder = (mod1.order + mod2.order) / 2;

    // Create the "Test" module
    const testModule = await Module.create({
      title: 'Test',
      chapterId: mod1.chapterId,
      unitId: mod1.unitId,
      order: newOrder
    });

    console.log(`\nSuccessfully created module "Test" successfully with order: ${newOrder}!`);
    console.log(`It is now positioned between "${mod1.title}" and "${mod2.title}".`);
    
  } catch (err) {
    console.error("Error creating module:", err);
  } finally {
    process.exit(0);
  }
}

addTestModule();
