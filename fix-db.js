import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Board from './models/Board.js';
import ClassLevel from './models/ClassLevel.js';
import Subject from './models/Subject.js';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB structure');

  const boards = await Board.find({});
  const validBoardNames = ['cbse', 'eduvate', 'eduvate (cbse)', 'icse'];
  
  const invalidBoards = boards.filter(b => !validBoardNames.some(v => b.name.toLowerCase() === v));
  console.log('Invalid boards to delete:', invalidBoards.map(b => b.name));

  let idsToDelete = invalidBoards.map(b => b._id);
  
  if (idsToDelete.length > 0) {
    const classes = await ClassLevel.find({ boardId: { $in: idsToDelete } });
    const classIds = classes.map(c => c._id);
    console.log(`Deleting ${classIds.length} ClassLevels`);
    await ClassLevel.deleteMany({ boardId: { $in: idsToDelete } });

    const subjects = await Subject.find({ classId: { $in: classIds } });
    const subjectIds = subjects.map(s => s._id);
    console.log(`Deleting ${subjectIds.length} Subjects...`);
    await Subject.deleteMany({ classId: { $in: classIds } });

    const chapters = await Chapter.find({ subjectId: { $in: subjectIds } });
    const chapterIds = chapters.map(c => c._id);
    console.log(`Deleting ${chapterIds.length} Chapters`);
    await Chapter.deleteMany({ subjectId: { $in: subjectIds } });

    const units = await Unit.find({ chapterId: { $in: chapterIds } });
    const unitIds = units.map(u => u._id);
    console.log(`Deleting ${unitIds.length} Units`);
    await Unit.deleteMany({ chapterId: { $in: chapterIds } });

    const modules = await Module.find({ unitId: { $in: unitIds } });
    const moduleIds = modules.map(m => m._id);
    console.log(`Deleting ${modules.length} Modules`);
    await Module.deleteMany({ unitId: { $in: unitIds } });

    const items = await CurriculumItem.find({ moduleId: { $in: moduleIds } });
    console.log(`Deleting ${items.length} CurriculumItems`);
    await CurriculumItem.deleteMany({ moduleId: { $in: moduleIds } });

    await Board.deleteMany({ _id: { $in: idsToDelete } });
    console.log('Deleted invalid boards effectively!');
  } else {
    console.log('No invalid boards found.');
  }

  // Also clean up the broken modules from "Chapter 1: Measurement and motion"
  const targetChapter = await Chapter.findOne({ title: 'Chapter 1: Measurement and motion' });
  if (targetChapter) {
    console.log('Found target chapter. Deep cleaning modules to fix duplicate key error.');
    const units = await Unit.find({ chapterId: targetChapter._id });
    for (const u of units) {
         const mods = await Module.find({ unitId: u._id });
         const modIds = mods.map(m => m._id);
         await CurriculumItem.deleteMany({ moduleId: { $in: modIds } });
         await Module.deleteMany({ unitId: u._id });
         await Unit.deleteOne({ _id: u._id });
    }
    
    // Check for orphaned/cross-unit modules
    const orphanedMods = await Module.find({ chapterId: targetChapter._id });
    if (orphanedMods.length > 0) {
        console.log(`Found ${orphanedMods.length} lingering modules! Obliterating.`);
        const orphanedModIds = orphanedMods.map(m => m._id);
        await CurriculumItem.deleteMany({ moduleId: { $in: orphanedModIds } });
        await Module.deleteMany({ chapterId: targetChapter._id });
    }
  }

  process.exit(0);
}

run();
