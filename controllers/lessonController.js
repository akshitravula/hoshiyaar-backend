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
    const moduleNumber = parseInt(req.params.moduleNumber);
    if (isNaN(moduleNumber)) {
      return res.status(400).json({ message: 'Invalid module number' });
    }

    const payload = req.body;
    if (!payload || !Array.isArray(payload.lessons)) {
      return res.status(400).json({ message: 'Invalid payload: expected lessons[]' });
    }

    // Remove existing items for module
    await LessonItem.deleteMany({ module: moduleNumber });

    const docs = [];
    let order = 0;
    for (const lesson of payload.lessons) {
      const concepts = Array.isArray(lesson.concepts) ? lesson.concepts : [];
      for (const c of concepts) {
        order += 1;
        if (c.type === 'statement') {
          docs.push({
            module: moduleNumber,
            type: 'statement',
            title: lesson.lesson_title || payload.module_title || undefined,
            text: c.text,
            order,
          });
        } else if (c.type === 'multiple-choice') {
          docs.push({
            module: moduleNumber,
            type: 'multiple-choice',
            title: lesson.lesson_title || payload.module_title || undefined,
            question: c.question,
            options: c.options || [],
            answer: c.answer,
            order,
          });
        } else if (c.type === 'rearrange') {
          docs.push({
            module: moduleNumber,
            type: 'rearrange',
            title: lesson.lesson_title || payload.module_title || undefined,
            question: c.question,
            words: c.words || [],
            answer: c.answer,
            order,
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