/**
 * import-unit2.js
 * Imports D:\diversity_new.csv into Chapter 2: Diversity in the Living World
 * CSV format: Unit_title, lesson_title, type, concept/statement, question,
 *             Options, answer, Revise, Images 1, Images 2, Images 3,
 *             Images 1 (dup), Images 2 (dup), Images 3 (dup)
 *
 * Hardcoded context: Class 6 / CBSE / Science / Chapter 2
 */

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

// ── Hardcoded context ──────────────────────────────────────────────────────
const BOARD_NAME    = 'CBSE';
const CLASS_TITLE   = '6';
const SUBJECT_NAME  = 'Science';
const CHAPTER_TITLE = 'Chapter 2: Diversity in the Living World';
const CSV_PATH      = process.argv[2] || 'D:\\diversity_new.csv';
// ──────────────────────────────────────────────────────────────────────────

function splitCsvLine(line) {
  const result = [];
  let curValue = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { curValue += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(curValue.trim());
      curValue = '';
    } else {
      curValue += char;
    }
  }
  result.push(curValue.trim());
  return result;
}

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── Resolve fixed hierarchy ─────────────────────────────────────────────
  let board = await Board.findOne({ name: BOARD_NAME });
  if (!board) board = await Board.create({ name: BOARD_NAME, slug: 'cbse' });

  let cls = await ClassLevel.findOne({ name: CLASS_TITLE, boardId: board._id });
  if (!cls) cls = await ClassLevel.create({ name: CLASS_TITLE, boardId: board._id, order: 6 });

  let subject = await Subject.findOne({ name: SUBJECT_NAME, classId: cls._id });
  if (!subject) subject = await Subject.create({ name: SUBJECT_NAME, classId: cls._id, icon: 'book' });

  let chapter = await Chapter.findOne({ title: CHAPTER_TITLE, subjectId: subject._id });
  if (!chapter) {
    chapter = await Chapter.create({ title: CHAPTER_TITLE, subjectId: subject._id, order: 2 });
    console.log(`📖 Created Chapter: ${CHAPTER_TITLE}`);
  } else {
    console.log(`📖 Found existing Chapter: ${CHAPTER_TITLE}`);
  }

  // ── Parse CSV ───────────────────────────────────────────────────────────
  const content  = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines    = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const dataLines = lines.slice(1); // skip header

  const typeMapping = {
    'comic':      'comic',
    'concept':    'statement',
    'mcq':        'multiple-choice',
    're-arrange': 'rearrange',
    'rearrange':  'rearrange',
    'fib':        'fill-in-the-blank'
  };

  let totalImported = 0;
  let currentOrder  = 1;
  let lastModuleId  = null;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line.trim() || line.startsWith(',,')) continue;

    const cols = splitCsvLine(line);
    if (cols.length < 3) continue;

    // Header: Unit_title, lesson_title, type, concept/statement, question,
    //         Options, answer, Revise, Images 1, Images 2, Images 3,
    //         Images 1 (dup), Images 2 (dup), Images 3 (dup)
    const [
      unitTitle,
      lessonTitle,
      typeStr,
      conceptText,
      questionText,
      optionsStr,
      answerText,
      ,           // Revise (unused)
      img1,
      img2,
      img3
    ] = cols;

    if (!unitTitle || !lessonTitle || !typeStr) {
      console.warn(`  ⚠️  Skipping incomplete line ${i + 2}`);
      continue;
    }

    // Unit
    let unit = await Unit.findOne({ title: unitTitle, chapterId: chapter._id });
    if (!unit) {
      unit = await Unit.create({ title: unitTitle, chapterId: chapter._id, order: 2 });
      console.log(`  📂 Created Unit: ${unitTitle}`);
    }

    // Module (lesson)
    let mod = await Module.findOne({ title: lessonTitle, unitId: unit._id });
    if (!mod) {
      mod = await Module.create({ title: lessonTitle, unitId: unit._id, chapterId: chapter._id, order: 1 });
      console.log(`  📄 Created Module: ${lessonTitle}`);
    }

    // Reset order counter when module changes
    if (String(mod._id) !== String(lastModuleId)) {
      currentOrder = 1;
      lastModuleId = mod._id;
    }

    const targetType = typeMapping[typeStr.toLowerCase().trim()];
    if (!targetType) {
      console.warn(`  ⚠️  Unknown type "${typeStr}" at line ${i + 2}. Skipping.`);
      continue;
    }

    const options = optionsStr ? optionsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const images  = [img1, img2, img3].filter(Boolean).map(s => s.trim());

    const itemDoc = {
      moduleId: mod._id,
      order:    currentOrder++,
      type:     targetType,
      images:   images
    };

    if (targetType === 'comic' || targetType === 'statement') {
      itemDoc.text = conceptText || questionText;
    } else {
      itemDoc.question = questionText;
      itemDoc.answer   = answerText;
      if (options.length > 0) {
        itemDoc.options = options;
        if (targetType === 'rearrange') itemDoc.words = options;
      }
    }

    try {
      await CurriculumItem.create(itemDoc);
      totalImported++;
      if (totalImported % 20 === 0) console.log(`  ✅ Imported ${totalImported} items...`);
    } catch (err) {
      console.error(`  ❌ Error at line ${i + 2}:`, err.message);
      console.error('  Item:', JSON.stringify(itemDoc));
      throw err;
    }
  }

  console.log(`\n✅ Import complete! Total items imported: ${totalImported}`);
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

run().catch(async (err) => {
  console.error('❌ Critical Error:', err);
  await mongoose.disconnect();
  process.exit(1);
});
