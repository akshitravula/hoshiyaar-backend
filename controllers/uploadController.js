import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Multer in-memory storage for simple uploads
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage }).single('file');
export const uploadManyMiddleware = multer({ storage }).array('files', 10);

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    // Ensure Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ message: 'Cloudinary not configured' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: req.body.folder || 'hoshiyaar' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    return res.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

export const uploadImages = async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ message: 'No files provided' });
    if (!process.env.CLOUDINARY_CLOUD_NAME) return res.status(500).json({ message: 'Cloudinary not configured' });

    const results = await Promise.all(files.map(f => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: req.body.folder || 'hoshiyaar' },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      );
      stream.end(f.buffer);
    })));

    return res.json({ images: results });
  } catch (err) {
    return res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};


