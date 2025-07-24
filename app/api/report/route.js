import { NextResponse } from 'next/server';
import prisma from "@/prisma/PrismaClient"
import { deleteUploadedFile } from '@/app/lib/multer';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const regionId = searchParams.get('regionId');
    
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status !== null && status !== undefined) {
      where.status = parseInt(status);
    }
    if (regionId) {
      where.regionId = parseInt(regionId);
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        region: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      skip,
      take: limit
    });

    const totalReports = await prisma.report.count({ where });
    
    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total: totalReports,
        totalPages: Math.ceil(totalReports / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    let title, description, regionId, userId, name, sourceIP, imgUrl;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      title = formData.get('title');
      description = formData.get('description');
      regionId = formData.get('regionId');
      userId = formData.get('userId');
      name = formData.get('name');
      sourceIP = formData.get('sourceIP');
      imgUrl = formData.get('imgUrl') || ''; 
      
      const imageFile = formData.get('image');
      if (imageFile && imageFile instanceof File) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
          return NextResponse.json(
            { success: false, error: 'Invalid file type. Only images are allowed.' },
            { status: 400 }
          );
        }

        if (imageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: 'File size too large. Maximum 5MB allowed.' },
            { status: 400 }
          );
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = imageFile.name.split('.').pop();
        const filename = `report-${uniqueSuffix}.${ext}`;
        
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
        
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);

        imgUrl = `/uploads/reports/${filename}`;
      }
    } else {
      const body = await request.json();
      ({ title, description, regionId, userId, name, sourceIP, imgUrl } = body);
    }

    if (!title || !description || !regionId) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and regionId are required' },
        { status: 400 }
      );
    }

    const region = await prisma.region.findUnique({
      where: { id: parseInt(regionId) }
    });

    if (!region) {
      return NextResponse.json(
        { success: false, error: 'Region not found' },
        { status: 404 }
      );
    }

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    }

    const newReport = await prisma.report.create({
      data: {
        title,
        description,
        regionId: parseInt(regionId),
        userId: userId ? parseInt(userId) : null,
        name: name || null,
        sourceIP: sourceIP || null,
        imgUrl: imgUrl || '',
        status: 0 
      },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newReport,
      message: 'Report created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}