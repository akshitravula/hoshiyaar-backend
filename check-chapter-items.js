import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkFirstChapter = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const chapterId = '68e276243270eff9f574728d';
  const Module = mongoose.connection.db.collection('modules');
  const Item = mongoose.connection.db.collection('curriculumitems');
  
  const modules = await Module.find({ chapterId: new mongoose.Types.ObjectId(chapterId) }).sort({ order: 1 }).toArray();
  console.log(`Found ${modules.length} modules for Chapter ${chapterId}`);
  
  for (const m of modules) {
    const count = await Item.countDocuments({ moduleId: m._id });
    const stringCount = await Item.countDocuments({ moduleId: m._id.toString() });
    console.log(`Module: "${m.title}" (_id: ${m._id}) -> Items: ${count} (String format: ${stringCount})`);
  }
  
  await mongoose.disconnect();
};

checkFirstChapter().catch(console.error);
