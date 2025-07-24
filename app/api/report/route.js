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
