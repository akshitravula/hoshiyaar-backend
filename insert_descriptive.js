import mongoose from 'mongoose';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';
import * as dotenv from 'dotenv';
dotenv.config();

// Fallback to cluster URI in case .env doesn't load
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb+srv://admin:admin@cluster0.n1b92.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB.");

    // Find "system of units" and "standard units and si units"
    const mod1 = await Module.findOne({ title: /systems? of units/i });
    const mod2 = await Module.findOne({ title: /standard units/i });

    if (!mod1 || !mod2) {
      console.log("Could not find both surrounding modules!");
      console.log("Found Mod1 (/system of units/i):", !!mod1, mod1?.title);
      console.log("Found Mod2 (/standard units/i):", !!mod2, mod2?.title);
      process.exit(1);
    }
    
    console.log(`Found: "${mod1.title}" (order: ${mod1.order}) and "${mod2.title}" (order: ${mod2.order})`);

    // Ensure it goes between them (e.g. fractional order)
    const newOrder = (mod1.order + mod2.order) / 2;

    const newMod = await Module.create({
      title: "Concept Review: Systems",
      chapterId: mod1.chapterId,
      unitId: mod1.unitId, // keep it inside the same unit
      order: newOrder,
      isDescriptive: true
    });
    console.log("Created descriptive module:", newMod.title, "with _id:", newMod._id);

    // Create the demo descriptive question inside this new module
    const newItem = await CurriculumItem.create({
      moduleId: newMod._id,
      order: 1,
      type: "descriptive",
      question: "Explain the main advantage of using Standard SI units over traditional local measures.",
      text: "Standard SI units provide consistency and uniformity across the world, making scientific communication and international trade reliable and accurate.",
      keywords: ["consistency", "uniformity", "world", "reliable", "accurate"],
      modelAnswers: [
        "SI units bring consistency globally so that measurements are the same everywhere.",
        "They offer uniformity, making it much easier to share data and trade goods internationally without confusion."
      ]
    });
    console.log("Created demo descriptive item:", newItem._id);

    console.log("Successfully inserted the descriptive module!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
