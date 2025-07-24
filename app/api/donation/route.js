import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/PrismaClient';

// GET - Fetch donations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');
    const paymentStatus = searchParams.get('paymentStatus');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    if (regionId) where.regionId = parseInt(regionId);
    if (paymentStatus !== null && paymentStatus !== undefined) {
      where.paymentStatus = parseInt(paymentStatus);
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
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
      prisma.donation.count({ where })
    ]);

    const totalAmount = await prisma.donation.aggregate({
      where: {
        ...where,
        paymentStatus: 1 // success
      },
      _sum: {
        amount: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        donations,
        totalAmount: totalAmount._sum.amount || 0,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { donorName, amount, message, regionId } = body;

    if (!amount || !regionId) {
      return NextResponse.json(
        { success: false, error: 'Amount and regionId are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
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

    const donation = await prisma.donation.create({
      data: {
        donorName: donorName || 'Anonymous',
        amount: parseFloat(amount),
        message: message || '',
        regionId: parseInt(regionId),
        paymentStatus: 0 // pending
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

    // integrate with a payment gateway
    
    return NextResponse.json({
      success: true,
      data: {
        donation,
        paymentUrl: `/payment/${donation.id}`, // This would be your payment gateway URL
        message: 'Donation created successfully. Please complete the payment.'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}