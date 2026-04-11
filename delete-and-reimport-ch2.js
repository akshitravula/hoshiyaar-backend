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

const CHAPTER_TITLE = 'Chapter 2: Diversity in the Living World';
const CSV_PATH = process.argv[2] || 'D:\\diversity.csv';

/**
 * Robust CSV Line Splitter — handles commas within double quotes.
 */
function splitCsvLine(line) {
  const result = [];
  let curValue = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        curValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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
    console.error(`CSV file not found: ${CSV_PATH}`);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ─── STEP 1: DELETE CHAPTER 2 DATA ──────────────────────────────────────
  console.log(`\n🗑️  Deleting all data for "${CHAPTER_TITLE}"...\n`);

  // Find all chapters with that title (across any subject)
  const chapters = await Chapter.find({ title: CHAPTER_TITLE });
  console.log(`Found ${chapters.length} chapter(s) named "${CHAPTER_TITLE}"`);

  for (const chapter of chapters) {
    const chapterId = chapter._id;

    // Find all units under this chapter
    const units = await Unit.find({ chapterId });
    const unitIds = units.map(u => u._id);
    console.log(`  Chapter "${chapter.title}" → ${units.length} unit(s)`);

    // Find all modules under these units
    const modules = await Module.find({ unitId: { $in: unitIds } });
    const moduleIds = modules.map(m => m._id);
    console.log(`  → ${modules.length} module(s)`);

    // Delete all CurriculumItems under these modules
    const itemResult = await CurriculumItem.deleteMany({ moduleId: { $in: moduleIds } });
    console.log(`  → Deleted ${itemResult.deletedCount} CurriculumItem(s)`);

    // Delete all Modules
    const modResult = await Module.deleteMany({ unitId: { $in: unitIds } });
    console.log(`  → Deleted ${modResult.deletedCount} Module(s)`);

    // Delete all Units
    const unitResult = await Unit.deleteMany({ chapterId });
    console.log(`  → Deleted ${unitResult.deletedCount} Unit(s)`);

    // Delete the Chapter itself
    await Chapter.deleteOne({ _id: chapterId });
    console.log(`  → Deleted Chapter "${chapter.title}"`);
  }

  if (chapters.length === 0) {
    console.log('  No matching chapters found — nothing to delete.');
  }

  console.log('\n✅ Delete complete.\n');

  // ─── STEP 2: REIMPORT FROM CSV ───────────────────────────────────────────
  console.log(`📥 Importing from CSV: ${CSV_PATH}\n`);

  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  const dataLines = lines.slice(1); // skip header

  const typeMapping = {
    'comic': 'comic',
    'concept': 'statement',
    'mcq': 'multiple-choice',
    're-arrange': 'rearrange',
    'rearrange': 'rearrange',
    'fib': 'fill-in-the-blank'
  };

  let totalImported = 0;
  let currentOrder = 1;
  let lastModuleId = null;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line.trim() || line.startsWith(',,,,,,')) continue;

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
      , // revise (unused)
      img1,
      img2,
      img3
    ] = columns;

    if (!boardName || !classTitle || !subjectName || !chapterTitle || !unitTitle || !lessonTitle || !typeStr) {
      console.warn(`  ⚠️  Skipping incomplete line ${i + 2}`);
      continue;
    }

    // Resolve hierarchy (find or create)
    let board = await Board.findOne({ name: boardName });
    if (!board) board = await Board.create({ name: boardName, slug: boardName.toLowerCase().replace(/ /g, '-') });

    let cls = await ClassLevel.findOne({ name: classTitle, boardId: board._id });
    if (!cls) cls = await ClassLevel.create({ name: classTitle, boardId: board._id, order: parseInt(classTitle) || 0 });

    let subject = await Subject.findOne({ name: subjectName, classId: cls._id });
    if (!subject) subject = await Subject.create({ name: subjectName, classId: cls._id, icon: 'book' });

    let chapter = await Chapter.findOne({ title: chapterTitle, subjectId: subject._id });
    if (!chapter) {
      chapter = await Chapter.create({ title: chapterTitle, subjectId: subject._id, order: 1 });
      console.log(`  📖 Created Chapter: ${chapterTitle}`);
    }

    let unit = await Unit.findOne({ title: unitTitle, chapterId: chapter._id });
    if (!unit) {
      unit = await Unit.create({ title: unitTitle, chapterId: chapter._id, order: 1 });
      console.log(`  📂 Created Unit: ${unitTitle}`);
    }

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
    const images = [img1, img2, img3].filter(Boolean).map(s => s.trim());

    const itemDoc = {
      moduleId: mod._id,
      order: currentOrder++,
      type: targetType,
      images: images
    };

    if (targetType === 'comic' || targetType === 'statement') {
      itemDoc.text = conceptText || questionText;
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
