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

const CSV_PATHS = [
  'D:\\Measurements and Motions Unit 1.csv',
  'D:\\Measurements and Motions Unit 2.csv'
];

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

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  try {
    await Module.collection.dropIndex('chapterId_1_title_1');
    console.log('🧹 Dropped legacy unique index on chapterId & title to allow cross-unit shared names');
  } catch (err) {
    if (err.codeName !== 'IndexNotFound') {
        console.log('⚠️ Could not drop index:', err.message);
    }
  }

  // STEP 1: DELETE ALL DATA FOR THE TWO UNITS.
  const UNIT_TITLES = ['Unit 1: Measurements and Measuring Tools', 'Unit 2: Motion Around Us'];
  const CHAPTER_TITLE = 'Chapter 1: Measurement and motion';

  console.log(`\n🗑️ Deleting data for Units: ${UNIT_TITLES.join(', ')} ...\n`);
  const chapters = await Chapter.find({ title: CHAPTER_TITLE });
  
  for (const chapter of chapters) {
    const units = await Unit.find({ chapterId: chapter._id, title: { $in: UNIT_TITLES } });
    
    for (const unit of units) {
      console.log(`  Deleting Unit: "${unit.title}"`);
      
      const modules = await Module.find({ unitId: unit._id });
      const moduleIds = modules.map(m => m._id);
      
      const itemResult = await CurriculumItem.deleteMany({ moduleId: { $in: moduleIds } });
      console.log(`  → Deleted ${itemResult.deletedCount} CurriculumItem(s)`);
      
      const modResult = await Module.deleteMany({ unitId: unit._id });
      console.log(`  → Deleted ${modResult.deletedCount} Module(s)`);
      
      await Unit.deleteOne({ _id: unit._id });
      console.log(`  → Deleted Unit`);
    }
  }
  console.log('\n✅ Deletion complete.\n');

  // STEP 2: IMPORT
  const typeMapping = {
    'comic': 'comic',
    'concept': 'statement',
    'mcq': 'multiple-choice',
    're-arrange': 'rearrange',
    'rearrange': 'rearrange',
    'fib': 'fill-in-the-blank'
  };

  let totalImported = 0;

  for (const csvPath of CSV_PATHS) {
    if (!fs.existsSync(csvPath)) {
      console.warn(`⚠️ CSV file not found: ${csvPath}. Skipping.`);
      continue;
    }
    console.log(`\n📥 Importing from CSV: ${csvPath}\n`);

    const content = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(content);
    const dataRows = rows.slice(1);

    let currentItemOrder = 1;
    let currentModuleOrder = 1;
    let lastModuleId = null;
    let difficultBuffer = []; // Buffer to hold questions marked as difficult

    for (let i = 0; i < dataRows.length; i++) {
        const columns = dataRows[i];
        if (columns.length < 7 || columns.slice(0, 6).every(c => !c)) continue;
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
          reviseValue,
          difficultValue, // Y/N for difficult module
          img1,
          img2,
          img3
        ] = columns;

        if (!boardName || !classTitle || !subjectName || !chapterTitle || !unitTitle || !lessonTitle || !typeStr) {
          continue;
        }

        let board = await Board.findOne({ name: boardName });
        if (!board) board = await Board.create({ name: boardName, slug: boardName.toLowerCase().replace(/ /g, '-') });

        let cls = await ClassLevel.findOne({ name: classTitle, boardId: board._id });
        if (!cls) cls = await ClassLevel.create({ name: classTitle, boardId: board._id, order: parseInt(classTitle) || 0 });

        let subject = await Subject.findOne({ name: subjectName, classId: cls._id, boardId: board._id });
        if (!subject) subject = await Subject.create({ name: subjectName, classId: cls._id, boardId: board._id });

        let chapter = await Chapter.findOne({ title: chapterTitle, subjectId: subject._id });
        if (!chapter) {
          chapter = await Chapter.create({ title: chapterTitle, subjectId: subject._id, order: 1 });
        }

        let unit = await Unit.findOne({ title: unitTitle, chapterId: chapter._id });
        if (!unit) {
          unit = await Unit.create({ title: unitTitle, chapterId: chapter._id, order: 1 });
        }

        let mod = await Module.findOne({ title: lessonTitle, unitId: unit._id });
        const isDifficultModule = lessonTitle.toLowerCase().includes('difficult');
        
        if (!mod) {
          mod = await Module.create({ 
            title: lessonTitle, 
            unitId: unit._id, 
            chapterId: chapter._id, 
            order: currentModuleOrder++,
            isDifficult: isDifficultModule
          });
          console.log(`  📄 Created Module with precise order [${mod.order}]: ${lessonTitle}`);
        } else if (isDifficultModule && !mod.isDifficult) {
          mod.isDifficult = true;
          await mod.save();
        }

        if (String(mod._id) !== String(lastModuleId)) {
          currentItemOrder = 1;
          lastModuleId = mod._id;
          
          // If this is a new module AND it is a difficult module, flush the buffer
          if (isDifficultModule && difficultBuffer.length > 0) {
            console.log(`    ⭐ Injecting ${difficultBuffer.length} buffered difficult questions into "${lessonTitle}"...`);
            for (const bufferedItem of difficultBuffer) {
              await CurriculumItem.create({
                ...bufferedItem,
                moduleId: mod._id,
                order: currentItemOrder++
              });
              totalImported++;
            }
            difficultBuffer = []; // Clear the buffer after flushing
          }
        }

        const targetType = typeMapping[typeStr.toLowerCase().trim()];
        if (!targetType) {
          console.warn(`  ⚠️ Unknown type "${typeStr}" at line ${i + 2}. Skipping.`);
          continue;
        }

        let options = [];
        if (targetType === 'rearrange') {
           if (optionsStr && optionsStr.trim().length > 0) {
               const providedOptions = optionsStr.split(',').map(s => s.trim()).filter(Boolean);
               if (providedOptions.length > 0) {
                  let shuffled = shuffleArray(providedOptions);
                  if (shuffled.join(',') === providedOptions.join(',') && shuffled.length > 1) {
                     [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
                  }
                  options = shuffled;
               }
           } else if (answerText && answerText.trim().length > 0) {
               const derivedOptions = answerText.split(',').map(s => s.trim()).filter(Boolean);
               if (derivedOptions.length > 0) {
                  let shuffled = shuffleArray(derivedOptions);
                  if (shuffled.join(',') === derivedOptions.join(',') && shuffled.length > 1) {
                     [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
                  }
                  options = shuffled;
               }
           }
        } else {
            options = optionsStr ? optionsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
        }

        const images = [img1, img2, img3].filter(Boolean).map(s => s.trim());

        const itemDoc = {
          moduleId: mod._id,
          order: currentItemOrder++,
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

        await CurriculumItem.create(itemDoc);
        totalImported++;

        // If the difficult column has 'Y' or 'y', add this item to the difficult buffer
        if (difficultValue && difficultValue.trim().toLowerCase() === 'y') {
          // Clone the object but omit moduleId and order, so these will be generated later based on the difficult module
          const { moduleId: _, order: __, ...bufferedDoc } = itemDoc;
          difficultBuffer.push(bufferedDoc);
        }
    }
  }

  console.log(`\n✅ Import complete! Total items imported: ${totalImported}`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('❌ Critical Error:', err);
  await mongoose.disconnect();
  process.exit(1);
});
