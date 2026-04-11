/**
 * delete-and-reimport-unit2.js
 * Deletes Unit 2 of Chapter 2 and reimports from D:\diversity_new.csv
 */

import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import Chapter from './models/Chapter.js';
import Unit from './models/Unit.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';
import Board from './models/Board.js';
import ClassLevel from './models/ClassLevel.js';
import Subject from './models/Subject.js';

dotenv.config();

const BOARD_NAME    = 'CBSE';
const CLASS_TITLE   = '6';
const SUBJECT_NAME  = 'Science';
const CHAPTER_TITLE = 'Chapter 2: Diversity in the Living World';
const UNIT2_PREFIX  = 'Unit 2';
const CSV_PATH      = process.argv[2] || 'D:\\diversity_new.csv';

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

  // ── STEP 1: Delete existing Unit 2 data ──────────────────────────────────
  console.log(`🗑️  Deleting existing Unit 2 data from "${CHAPTER_TITLE}"...\n`);

  const chapters = await Chapter.find({ title: CHAPTER_TITLE });
  for (const chapter of chapters) {
    // Find all Unit 2 units under this chapter
    const units = await Unit.find({ chapterId: chapter._id, title: { $regex: `^${UNIT2_PREFIX}` } });
    console.log(`  Found ${units.length} Unit 2 unit(s) to delete`);

    for (const unit of units) {
      const modules = await Module.find({ unitId: unit._id });
      const moduleIds = modules.map(m => m._id);

      const itemResult = await CurriculumItem.deleteMany({ moduleId: { $in: moduleIds } });
      console.log(`  → Deleted ${itemResult.deletedCount} CurriculumItem(s) from "${unit.title}"`);

      const modResult = await Module.deleteMany({ unitId: unit._id });
      console.log(`  → Deleted ${modResult.deletedCount} Module(s)`);

      await Unit.deleteOne({ _id: unit._id });
      console.log(`  → Deleted Unit: "${unit.title}"`);
    }
  }

  console.log('\n✅ Delete complete.\n');

  // ── STEP 2: Reimport from CSV ─────────────────────────────────────────────
  console.log(`📥 Importing from: ${CSV_PATH}\n`);

  // Resolve fixed hierarchy
  let board = await Board.findOne({ name: BOARD_NAME });
  if (!board) board = await Board.create({ name: BOARD_NAME, slug: 'cbse' });

  let cls = await ClassLevel.findOne({ name: CLASS_TITLE, boardId: board._id });
  if (!cls) cls = await ClassLevel.create({ name: CLASS_TITLE, boardId: board._id, order: 6 });

  let subject = await Subject.findOne({ name: SUBJECT_NAME, classId: cls._id });
  if (!subject) subject = await Subject.create({ name: SUBJECT_NAME, classId: cls._id, icon: 'book' });

  let chapter = await Chapter.findOne({ title: CHAPTER_TITLE, subjectId: subject._id });
  if (!chapter) {
    chapter = await Chapter.create({ title: CHAPTER_TITLE, subjectId: subject._id, order: 2 });
    console.log(`  📖 Created Chapter: ${CHAPTER_TITLE}`);
  } else {
    console.log(`  📖 Using existing Chapter: ${CHAPTER_TITLE}`);
  }

  const typeMapping = {
    'comic':      'comic',
    'concept':    'statement',
    'mcq':        'multiple-choice',
    're-arrange': 'rearrange',
    'rearrange':  'rearrange',
    'fib':        'fill-in-the-blank'
  };

  const content   = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines     = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const dataLines = lines.slice(1);

  let totalImported = 0;
  let currentOrder  = 1;
  let lastModuleId  = null;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line.trim() || line.startsWith(',,')) continue;

    const cols = splitCsvLine(line);
    if (cols.length < 3) continue;

    const [
      unitTitle,
      lessonTitle,
      typeStr,
      conceptText,
      questionText,
      optionsStr,
      answerText,
      ,     // Revise
      img1,
      img2,
      img3
    ] = cols;

    if (!unitTitle || !lessonTitle || !typeStr) {
      console.warn(`  ⚠️  Skipping incomplete line ${i + 2}`);
      continue;
    }

    let unit = await Unit.findOne({ title: unitTitle, chapterId: chapter._id });
    if (!unit) {
      unit = await Unit.create({ title: unitTitle, chapterId: chapter._id, order: 2 });
      console.log(`  📂 Created Unit: ${unitTitle}`);
    }

    let mod = await Module.findOne({ title: lessonTitle, unitId: unit._id });
    if (!mod) {
      mod = await Module.create({ title: lessonTitle, unitId: unit._id, chapterId: chapter._id, order: 1 });
      console.log(`  📄 Created Module: ${lessonTitle}`);
    }

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
      images
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
      if (totalImported % 50 === 0) console.log(`  ✅ Imported ${totalImported} items...`);
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
