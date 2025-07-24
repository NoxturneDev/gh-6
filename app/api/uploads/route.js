import { NextRequest, NextResponse } from 'next/server';
import { upload, processImage, getFileUrl } from '@/app/lib/multer';
import { promisify } from 'util';

// Convert multer middleware to work with Next.js
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images'); // 'images' is the field name
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    const uploadPromises = files.map(async (file) => {
      if (!(file instanceof File)) {
        throw new Error('Invalid file format');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}`);
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum 5MB allowed.');
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.name.split('.').pop();
      const filename = `${file.name.split('.')[0]}-${uniqueSuffix}.${ext}`;
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file to uploads directory
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      // Process image with Sharp (optional)
      let processedFilename = filename;
      try {
        processedFilename = await processImage(filePath, {
          width: 800,
          height: 600,
          quality: 80,
          format: 'jpeg'
        });
      } catch (processError) {
        console.log('Image processing failed, using original file:', processError.message);
      }

      return {
        originalName: file.name,
        filename: processedFilename,
        url: getFileUrl(processedFilename),
        size: file.size,
        type: file.type
      };
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      data: {
        files: results,
        count: results.length
      },
      message: 'Files uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to serve uploaded files (optional, since files are in public folder)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename parameter required' },
        { status: 400 }
      );
    }

    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'reports', filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    let contentType = 'application/octet-stream';
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}