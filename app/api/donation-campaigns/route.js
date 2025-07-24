import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/PrismaClient';
import { upload, processImage, getFileUrl } from '@/app/lib/multer';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    if (regionId) where.regionId = parseInt(regionId);
    if (status !== null && status !== undefined) where.status = parseInt(status);

    const [campaigns, total] = await Promise.all([
      prisma.donationCampaign.findMany({
        where,
        include: {
          region: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.donationCampaign.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching donation campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donation campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title');
    const description = formData.get('description');
    const regionId = parseInt(formData.get('regionId'));
    const targetAmount = parseFloat(formData.get('targetAmount'));
    const deadline = new Date(formData.get('deadline'));
    const imageFile = formData.get('image');

    if (!title || !description || !regionId || !targetAmount || !deadline) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (deadline <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Deadline must be in the future' },
        { status: 400 }
      );
    }

    const region = await prisma.region.findUnique({
      where: { id: regionId }
    });

    if (!region) {
      return NextResponse.json(
        { success: false, error: 'Region not found' },
        { status: 404 }
      );
    }

    let imageUrl = '';
    let imgUrl = '';

    if (imageFile && imageFile instanceof File) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${imageFile.type}` },
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
      const filename = `campaign-${uniqueSuffix}.${ext}`;
      
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'campaigns');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      try {
        const processedFilename = await processImage(filePath, {
          width: 800,
          height: 600,
          quality: 80,
          format: 'jpeg'
        });
        imageUrl = `/uploads/campaigns/${processedFilename}`;
        imgUrl = `/uploads/campaigns/${processedFilename}`;
      } catch (processError) {
        console.log('Image processing failed, using original file:', processError.message);
        imageUrl = `/uploads/campaigns/${filename}`;
        imgUrl = `/uploads/campaigns/${filename}`;
      }
    }

    const campaign = await prisma.donationCampaign.create({
      data: {
        title,
        description,
        regionId,
        targetAmount,
        deadline,
        imageUrl,
        imgUrl,
        status: 0 // active
      },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Donation campaign created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating donation campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create donation campaign' },
      { status: 500 }
    );
  }
}