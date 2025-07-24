import { NextResponse } from "next/server";
import prisma from "@/prisma/PrismaClient";

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, description, regionId, userId, name, sourceIP } = body;

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

    // If userId provided, check if user exists
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
        status: 0 // pending by default
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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
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