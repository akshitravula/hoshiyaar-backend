import express from 'express';
import { getLessonByModule, importLessons } from '../controllers/lessonController.js';
const router = express.Router();

// Route to get all items for a specific module number
// e.g., GET http://localhost:5000/api/lessons/1
router.get('/:moduleNumber', getLessonByModule);

// Import endpoint
router.post('/:moduleNumber/import', importLessons);

export default router;