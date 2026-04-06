import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkAllModules = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Module = mongoose.connection.db.collection('modules');
  const Item = mongoose.connection.db.collection('curriculumitems');
  
  const modules = await Module.find({}).sort({ order: 1 }).toArray();
  console.log(`Checking ${modules.length} modules...`);
  
  let emptyModules = 0;
  for (const m of modules) {
    const count = await Item.countDocuments({ moduleId: m._id });
    if (count === 0) {
      console.log(`EMPTY: "${m.title}" (_id: ${m._id})`);
      emptyModules++;
    } else {
      console.log(`OK: "${m.title}" -> ${count} items`);
    }
  }
  
  console.log(`Summary: ${emptyModules} empty modules out of ${modules.length} total.`);
  await mongoose.disconnect();
};

checkAllModules().catch(console.error);
