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

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const filePath = 'D:/diversity.csv';
    console.log(`Processing ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const rows = parseCSV(content);
    
    const data = rows.slice(1);
    console.log(`Found ${data.length} data rows.`);

    const titleMap = {
      "Characteristics & grouping": { title: "Characteristics & Grouping of Plants", order: 1 },
      "Grouping plants basis stem": { title: "Grouping of Plants Based on Stem", order: 2 },
      "Trees, Shrubs and Herbs": { title: "Trees, Shrubs and Herbs", order: 3 },
      "Climbers & creepers": { title: "Climbers & Creepers", order: 4 },
      "Venation in leaves": { title: "Venation in Leaves", order: 5 },
      "Examples of Leaf Venation": { title: "Examples of Leaf Venation", order: 6 },
      "Types of Roots": { title: "Types of Roots", order: 7 },
      "Examples of Roots": { title: "Examples of Roots", order: 8 },
      "Relation Between Roots and Leaf Venation": { title: "Relation Between Roots and Leaf Venation", order: 9 },
      "Types of Seeds": { title: "Types of Seeds", order: 10 },
      "Relation Between Venation Roots and Cotyledons": { title: "Relation Between Venation, Roots and Cotyledons", order: 11 }
    };

    const purgedChapters = new Set();
    let currentModule = null;
    let orderInModule = 1;

    for (const row of data) {
      if (row.length < 7) continue;

      const classTitle = row[0];
      const boardTitle = row[1];
      const subjectTitle = row[2];
      const chapterTitle = row[3];
      const unitTitle = row[4];
      const csvModuleTitle = row[5];
      const type = row[6];
      const conceptText = row[7];
      const question = row[8];
      const optionsStr = row[9];
      const answer = row[10];
      const imageUrl1 = row[12];
      const imageUrl2 = row[13];
      const imageUrl3 = row[14];

      if (!csvModuleTitle) continue;

      const mappedInfo = titleMap[csvModuleTitle] || { title: csvModuleTitle, order: 99 };
      const moduleTitle = mappedInfo.title;
      const moduleOrder = mappedInfo.order;

      // 1-4: Board, Class, Subject, Chapter
      let board = await Board.findOne({ name: boardTitle });
      if (!board) board = await Board.create({ name: boardTitle });

      let classLevel = await ClassLevel.findOne({ name: classTitle, boardId: board._id });
      if (!classLevel) classLevel = await ClassLevel.create({ name: classTitle, boardId: board._id });

      let subject = await Subject.findOne({ name: subjectTitle, boardId: board._id, classId: classLevel._id });
      if (!subject) subject = await Subject.create({ name: subjectTitle, boardId: board._id, classId: classLevel._id });

      let chapter = await Chapter.findOne({ title: chapterTitle, subjectId: subject._id });
      if (!chapter) {
        chapter = await Chapter.create({ title: chapterTitle, subjectId: subject._id, order: 2 });
      }

      // GLOBAL PURGE for this Chapter on first encounter
      if (!purgedChapters.has(chapter._id.toString())) {
        console.log(`Total Purge: Removing all Units and Modules for Chapter: ${chapterTitle}...`);
        const allUnits = await Unit.find({ chapterId: chapter._id });
        for (const u of allUnits) {
          const modulesInUnit = await Module.find({ unitId: u._id });
          for (const m of modulesInUnit) {
            await CurriculumItem.deleteMany({ moduleId: m._id });
          }
          await Module.deleteMany({ unitId: u._id });
        }
        await Unit.deleteMany({ chapterId: chapter._id });
        purgedChapters.add(chapter._id.toString());
        currentModule = null;
      }

      // 5. Unit
      let unit = await Unit.findOne({ title: "Unit 1: Plant Characteristics and Grouping", chapterId: chapter._id });
      if (!unit) {
        unit = await Unit.create({ title: "Unit 1: Plant Characteristics and Grouping", chapterId: chapter._id, order: 1 });
        console.log(`Created Canonical Unit: ${unit.title}`);
      }

      // 6. Module (Lesson)
      if (!currentModule || currentModule.title !== moduleTitle) {
        // Find existing in this specific Unit
        let existingModule = await Module.findOne({ title: moduleTitle, unitId: unit._id });
        if (existingModule) {
          currentModule = existingModule;
        } else {
          currentModule = await Module.create({ 
            title: moduleTitle, 
            unitId: unit._id, 
            chapterId: chapter._id, 
            order: moduleOrder
          });
          console.log(`Created Module: ${moduleTitle} (Order: ${currentModule.order})`);
        }
        orderInModule = 1;
      }

      // 7. CurriculumItem
      let mappedType = 'statement';
      const typeLower = type.toLowerCase();
      if (typeLower === 'comic') mappedType = 'comic';
      else if (typeLower === 'mcq') mappedType = 'multiple-choice';
      else if (typeLower === 'fib') mappedType = 'fill-in-the-blank';
      else if (typeLower === 're-arrange') mappedType = 'rearrange';
      else if (typeLower === 'concept') mappedType = 'statement';

      const images = [];
      if (imageUrl1) images.push(imageUrl1);
      if (imageUrl2) images.push(imageUrl2);
      if (imageUrl3) images.push(imageUrl3);

      const options = optionsStr ? optionsStr.split(',').map(o => o.trim()).filter(o => o) : [];
      let finalAnswer = answer;
      let finalWords = [];

      if (mappedType === 'rearrange') {
        // Rearrange needs space-separated answer and 'words' array
        finalAnswer = answer.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
        finalWords = options;
      }

      await CurriculumItem.create({
        moduleId: currentModule._id,
        order: orderInModule++,
        type: mappedType,
        text: conceptText,
        question: question,
        options: options,
        words: finalWords,
        answer: finalAnswer,
        imageUrl: images[0] || '',
        images: images
      });
    }

    console.log('Re-import completed successfully!');
  } catch (error) {
    console.error('Re-import failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
