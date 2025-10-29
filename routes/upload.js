import express from 'express';
import { uploadMiddleware, uploadImage, uploadManyMiddleware, uploadImages } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/image', uploadMiddleware, uploadImage);
router.post('/images', uploadManyMiddleware, uploadImages);

export default router;


