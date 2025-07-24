import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 5 
  }
});

export const processImage = async (filePath, options = {}) => {
  try {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg'
    } = options;

    const processedFileName = `processed-${path.basename(filePath, path.extname(filePath))}.${format}`;
    const processedPath = path.join(path.dirname(filePath), processedFileName);

    await sharp(filePath)
      .resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality })
      .toFile(processedPath);

    fs.unlinkSync(filePath);

    return processedFileName;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

export const deleteUploadedFile = (filename) => {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const getFileUrl = (filename) => {
  return `/uploads/reports/${filename}`;
};