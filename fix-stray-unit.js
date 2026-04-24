import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import Chapter from './models/Chapter.js';

dotenv.config();

async function fixStrayUnit() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Find the Chapter titled containing "Measurement and motion"
    const chapter = await Chapter.findOne({ title: { $regex: new RegExp('Measurement and motion', 'i') } });
    
    if (!chapter) {
      console.log('Chapter containing "Measurement and motion" not found.');
    } else {
      console.log(`Found Chapter: "${chapter.title}"`);
      
      // 2. Find a unit literally named "Unit" inside this chapter
      const strayUnit = await Unit.findOne({
        chapterId: chapter._id,
        title: { $regex: new RegExp('^Unit$', 'i') } // Exact match "Unit"
      });

      if (strayUnit) {
        console.log(`\nFound stray unit titled "${strayUnit.title}" (ID: ${strayUnit._id}).`);
        
        const moduleCount = await Module.countDocuments({ unitId: strayUnit._id });
        console.log(`Modules inside this stray unit: ${moduleCount}`);

        // If you just want to delete it:
        if (moduleCount === 0) {
          await Unit.deleteOne({ _id: strayUnit._id });
          console.log(`Success! Deleted the empty isolated "${strayUnit.title}".`);
        } else {
            // It has modules. Let's list what they are before deleting, or move them
            const modules = await Module.find({ unitId: strayUnit._id });
            console.log('Wait, it contains modules:');
            modules.forEach(m => console.log(` - ${m.title}`));
            // Force delete it and its modules if they are strays
            console.log('Deleting the unit and its nested modules just in case they are artifacts.');
            await Module.deleteMany({ unitId: strayUnit._id });
            await Unit.deleteOne({ _id: strayUnit._id });
            console.log(`Deleted unit and its modules.`);
        }
      } else {
        console.log('\nCould not find a unit literally called "Unit" inside this chapter.');
      }
    }

    // Secondary Cleanup: Let's also run a pass over all units to see if any have 0 modules NOW
    // Since we just deleted empty modules, some units might have become empty.
    const allUnits = await Unit.find({});
    let removedCounts = 0;
    for (const u of allUnits) {
       const cnt = await Module.countDocuments({ unitId: u._id });
       if (cnt === 0) {
           console.log(`\nDeleting newly emptied unit globally: "${u.title}"`);
           await Unit.deleteOne({ _id: u._id });
           removedCounts++;
       }
    }
    console.log(`Completed secondary global unit cleanup. Removed ${removedCounts} newly empty units.`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

fixStrayUnit();
