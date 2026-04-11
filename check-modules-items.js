import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkModulesAndItems = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- MODULES ---');
  const Module = mongoose.connection.db.collection('modules');
  const modules = await Module.find({}).sort({ order: 1 }).toArray();
  
  for (const m of modules) {
    const itemCount = await mongoose.connection.db.collection('curriculumitems').countDocuments({ moduleId: m._id });
    console.log(`Module: "${m.title}" (_id: ${m._id}, order: ${m.order}) -> ${itemCount} items`);
    
    if (itemCount === 0) {
      // Check if items exist but maybe with a string moduleId instead of ObjectId?
      const stringItemCount = await mongoose.connection.db.collection('curriculumitems').countDocuments({ moduleId: m._id.toString() });
      if (stringItemCount > 0) {
        console.log(`   !!! Found ${stringItemCount} items with STRING moduleId! This is the BUG.`);
      }
    }
  }
  
  await mongoose.disconnect();
};

checkModulesAndItems().catch(console.error);
