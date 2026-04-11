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

/**
 * Robust CSV Line Splitter
 * Handles commas within double quotes.
 */
function splitCsvLine(line) {
  const result = [];
  let curValue = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Double quote escape
        curValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(curValue.trim());
      curValue = "";
    } else {
      curValue += char;
    }
  }
  result.push(curValue.trim());
  return result;
}

async function importDiversityCsv() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node import-diversity.js <path-to-csv>");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');

  // Columns: Class_title,Board_title,Subject,Chapter_title,Unit_title,lesson_title,type,concept/statement,question,Options,answer,Revise?,Images 1,Images 2,Images 3
  const dataLines = lines.slice(1);

  let totalImported = 0;
  let currentOrder = 1;
  let lastModuleId = null;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line.trim() || line.startsWith(',,,,,,')) continue; // Skip empty rows

    const columns = splitCsvLine(line);
    if (columns.length < 7) continue;

    const [
      classTitle,
      boardName,
      subjectName,
      chapterTitle,
      unitTitle,
      lessonTitle,
      typeStr,
      conceptText,
      questionText,
      optionsStr,
      answerText,
      revise,
      img1,
      img2,
      img3
    ] = columns;

    if (!boardName || !classTitle || !subjectName || !chapterTitle || !unitTitle || !lessonTitle || !typeStr) {
      console.warn(`Skipping incomplete line ${i + 2}: ${line.substring(0, 50)}...`);
      continue;
    }

    // 1. Resolve Hierarchy (Find or Create)
    // Board
    let board = await Board.findOne({ name: boardName });
    if (!board) {
      board = await Board.create({ name: boardName, slug: boardName.toLowerCase().replace(/ /g, '-') });
      console.log(`Created Board: ${boardName}`);
    }

    // ClassLevel
    let cls = await ClassLevel.findOne({ name: classTitle, boardId: board._id });
    if (!cls) {
      cls = await ClassLevel.create({ name: classTitle, boardId: board._id, order: parseInt(classTitle) || 0 });
      console.log(`Created ClassLevel: ${classTitle}`);
    }

    // Subject
    let subject = await Subject.findOne({ name: subjectName, classId: cls._id });
    if (!subject) {
      subject = await Subject.create({ name: subjectName, classId: cls._id, icon: 'book' });
      console.log(`Created Subject: ${subjectName}`);
    }

    // Chapter
    let chapter = await Chapter.findOne({ title: chapterTitle, subjectId: subject._id });
    if (!chapter) {
      chapter = await Chapter.create({ title: chapterTitle, subjectId: subject._id, order: 1 });
      console.log(`Created Chapter: ${chapterTitle}`);
    }

    // Unit
    let unit = await Unit.findOne({ title: unitTitle, chapterId: chapter._id });
    if (!unit) {
      unit = await Unit.create({ title: unitTitle, chapterId: chapter._id, order: 1 });
      console.log(`Created Unit: ${unitTitle}`);
    }

    // Module (Mapping to lesson_title)
    let mod = await Module.findOne({ title: lessonTitle, unitId: unit._id });
    if (!mod) {
      mod = await Module.create({ title: lessonTitle, unitId: unit._id, chapterId: chapter._id, order: 1 });
      console.log(`Created Module: ${lessonTitle}`);
    }

    // Reset order if module changes
    if (String(mod._id) !== String(lastModuleId)) {
      currentOrder = 1;
      lastModuleId = mod._id;
    }

    // 2. Prepare Item
    const typeMapping = {
      'comic': 'comic',
      'concept': 'statement',
      'mcq': 'multiple-choice',
      're-arrange': 'rearrange',
      'rearrange': 'rearrange',
      'fib': 'fill-in-the-blank'
    };

    const targetType = typeMapping[typeStr.toLowerCase().trim()];
    if (!targetType) {
      console.warn(`Unknown type "${typeStr}" at line ${i + 2}. Skipping.`);
      continue;
    }

    const options = optionsStr ? optionsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const images = [img1, img2, img3].filter(Boolean).map(s => s.trim());

    const itemDoc = {
      moduleId: mod._id,
      order: currentOrder++,
      type: targetType,
      images: images
    };

    if (targetType === 'comic' || targetType === 'statement') {
      itemDoc.text = conceptText || questionText; // Use conceptText if available, fallback to questionText
    } else {
      itemDoc.question = questionText;
      itemDoc.answer = answerText;
      if (options.length > 0) {
        itemDoc.options = options;
        if (targetType === 'rearrange') itemDoc.words = options;
      }
    }

    try {
      await CurriculumItem.create(itemDoc);
      totalImported++;
      if (totalImported % 50 === 0) console.log(`Imported ${totalImported} items...`);
    } catch (err) {
      console.error(`Error creating item at line ${i + 2}:`, err.message);
      console.error("Item Data:", JSON.stringify(itemDoc, null, 2));
      throw err; // Re-throw to stop the script on first error for debugging
    }
  }

  console.log(`\nImport complete! Total items imported: ${totalImported}`);
  await mongoose.disconnect();
}

importDiversityCsv().catch(async (err) => {
  console.error("Critical Error during import:", err);
  await mongoose.disconnect();
  process.exit(1);
});
