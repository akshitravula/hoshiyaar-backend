import LessonItem from '../models/LessonItem.js';

// @desc    Get all lesson items for a specific module
// @route   GET /api/lessons/:moduleNumber
// @access  Public
export const getLessonByModule = async (req, res) => {
  try {
    const moduleNumber = parseInt(req.params.moduleNumber);
    if (isNaN(moduleNumber)) {
      return res.status(400).json({ message: 'Invalid module number' });
    }

    const lessonItems = await LessonItem.find({ module: moduleNumber }).sort({ order: 'asc' });

    if (!lessonItems || lessonItems.length === 0) {
      return res.status(404).json({ message: `No lesson items found for module ${moduleNumber}` });
    }

    res.status(200).json(lessonItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Import lessons from structured payload
// @route   POST /api/lessons/:moduleNumber/import
// @access  Public (consider protecting in production)
export const importLessons = async (req, res) => {
  try {
    // Find the actual module ID if a number was provided (for backward compatibility or simplified routes)
    // In a fully modular system, we should prefer passing 'moduleId' as an ObjectId string.
    let targetModuleId = req.params.moduleId || req.params.moduleNumber;
    
    // Remove existing items for module if replace requested
    if (payload.replace === true) {
        await LessonItem.deleteMany({ moduleId: targetModuleId });
    }

    const docs = [];
    const existingItems = await LessonItem.find({ moduleId: targetModuleId }).sort({ order: 1 });
    const maxOrder = existingItems.length > 0 ? Math.max(...existingItems.map(i => i.order || 0)) : 0;
    let currentOrder = Math.ceil(maxOrder / 1024 + 1) * 1024;

    for (const lesson of payload.lessons) {
      const concepts = Array.isArray(lesson.concepts) ? lesson.concepts : [];
      for (const c of concepts) {
        const order = c.order || currentOrder;
        if (!c.order) currentOrder += 1024;

        const baseDoc = {
          moduleId: targetModuleId,
          title: lesson.lesson_title || payload.module_title || undefined,
          order,
        };

        if (c.type === 'statement') {
          docs.push({ ...baseDoc, type: 'statement', text: c.text });
        } else if (c.type === 'multiple-choice') {
          docs.push({
            ...baseDoc,
            type: 'multiple-choice',
            question: c.question,
            options: c.options || [],
            answer: c.answer,
          });
        } else if (c.type === 'rearrange') {
          docs.push({
            ...baseDoc,
            type: 'rearrange',
            question: c.question,
            words: c.words || [],
            answer: c.answer,
          });
        }
      }
    }

    if (docs.length === 0) {
      return res.status(400).json({ message: 'No valid lesson items to import' });
    }

    const created = await LessonItem.insertMany(docs);
    res.status(201).json({ count: created.length, items: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};