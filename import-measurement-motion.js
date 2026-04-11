import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import Board from './models/Board.js';
import ClassLevel from './models/ClassLevel.js';
import Subject from './models/Subject.js';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';

dotenv.config();

function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r' || char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else {
        currentField += char;
      }
    }
  }
  if (currentRow.length > 0 || currentField !== '') {
    currentRow.push(currentField.trim());
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
      rows.push(currentRow);
    }
  }
  return rows;
}

async function importFile(filePath) {
  console.log(`Processing ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(content);
  
  const headers = rows[0];
  const data = rows.slice(1);

  console.log(`Found ${data.length} data rows.`);

  // Mapping based on expected indices
  // 0: Class_title, 1: Board_title, 2: Subject, 3: Chapter_title, 4: Unit_title, 5: lesson_title, 6: type, 
  // 7: concept/statement, 8: question, 9: Options, 10: answer, 11: Revise?, 12: Image 1, 13: Image 2, 14: Image 3

  let chapterId = null;
  let unitId = null;
  let currentModule = null;
  let orderInModule = 1;

  // Track modules to clear them once per chapter/unit if needed
  const clearedModules = new Set();

  for (const row of data) {
    if (row.length < 7) continue;

    const classTitle = row[0];
    let boardTitle = row[1].replace(/\n/g, ' ').trim(); // Clean up potential newlines
    const subjectTitle = row[2];
    const chapterTitle = row[3];
    const unitTitle = row[4];
    const moduleTitle = row[5];
    const type = row[6];
    const conceptText = row[7];
    const question = row[8];
    const optionsStr = row[9];
    const answer = row[10];
    const imageUrl1 = row[12];
    const imageUrl2 = row[13];
    const imageUrl3 = row[14];

    if (!moduleTitle) continue;

    // 1. Board
    let board = await Board.findOne({ name: boardTitle });
    if (!board) {
      board = await Board.create({ name: boardTitle });
      console.log(`Created Board: ${boardTitle}`);
    }

    // 2. ClassLevel
    let classLevel = await ClassLevel.findOne({ name: classTitle, boardId: board._id });
    if (!classLevel) {
      classLevel = await ClassLevel.create({ name: classTitle, boardId: board._id });
      console.log(`Created ClassLevel: ${classTitle}`);
    }

    // 3. Subject
    let subject = await Subject.findOne({ name: subjectTitle, boardId: board._id, classId: classLevel._id });
    if (!subject) {
      subject = await Subject.create({ name: subjectTitle, boardId: board._id, classId: classLevel._id });
      console.log(`Created Subject: ${subjectTitle}`);
    }

    // 4. Chapter
    let chapter = await Chapter.findOne({ title: chapterTitle, subjectId: subject._id });
    if (!chapter) {
      chapter = await Chapter.create({ title: chapterTitle, subjectId: subject._id, order: 1 });
      console.log(`Created Chapter: ${chapterTitle}`);
    }
    chapterId = chapter._id;

    // 5. Unit
    let unit = await Unit.findOne({ title: unitTitle, chapterId: chapter._id });
    if (!unit) {
      unit = await Unit.create({ title: unitTitle, chapterId: chapter._id, order: 1 });
      console.log(`Created Unit: ${unitTitle}`);
    }
    unitId = unit._id;

    // 6. Module
    if (!currentModule || currentModule.title !== moduleTitle) {
      // Clear module first if it exists to avoid duplicates
      let existingModule = await Module.findOne({ title: moduleTitle, unitId: unit._id });
      if (existingModule) {
        if (!clearedModules.has(existingModule._id.toString())) {
          await CurriculumItem.deleteMany({ moduleId: existingModule._id });
          await Module.deleteOne({ _id: existingModule._id });
          console.log(`Cleared existing module: ${moduleTitle}`);
          currentModule = await Module.create({ title: moduleTitle, unitId: unit._id, chapterId: chapter._id, order: 1 });
          clearedModules.add(currentModule._id.toString());
        } else {
          currentModule = existingModule;
        }
      } else {
        currentModule = await Module.create({ title: moduleTitle, unitId: unit._id, chapterId: chapter._id, order: 1 });
        console.log(`Created Module: ${moduleTitle}`);
        clearedModules.add(currentModule._id.toString());
      }
      orderInModule = 1;
    }

    // 7. CurriculumItem
    let mappedType = 'statement';
    if (type.toLowerCase() === 'comic') mappedType = 'comic';
    else if (type.toLowerCase() === 'mcq') mappedType = 'multiple-choice';
    else if (type.toLowerCase() === 'fib') mappedType = 'fill-in-the-blank';
    else if (type.toLowerCase() === 're-arrange') mappedType = 'rearrange';
    else if (type.toLowerCase() === 'concept') mappedType = 'statement';

    const images = [];
    if (imageUrl1) images.push(imageUrl1);
    if (imageUrl2) images.push(imageUrl2);
    if (imageUrl3) images.push(imageUrl3);

    const options = optionsStr ? optionsStr.split(',').map(o => o.trim()) : [];

    await CurriculumItem.create({
      moduleId: currentModule._id,
      order: orderInModule++,
      type: mappedType,
      text: conceptText,
      question: question,
      options: options,
      answer: answer,
      imageUrl: images[0] || '',
      images: images
    });
  }
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const files = [
      'D:/Measurements and Motions Unit 1.csv',
      'D:/Measurements and Motions Unit 2.csv'
    ];

    for (const file of files) {
      await importFile(file);
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
