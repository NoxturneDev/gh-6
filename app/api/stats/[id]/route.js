import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/stats/[id]
 * Returns detail information about a specific region
 */
export async function GET(req, { params }) {
  const param = await params;
  const id = param.id;
  const regionId = parseInt(id);
  console.log(regionId);

  if (isNaN(regionId)) {
    return Response.json({ error: 'Invalid region ID' }, { status: 400 });
  }

  try {
    const region = await prisma.region.findUnique({
      where: { id: regionId },
      include: {
        detail: true,
        classification: true,
        reports: {
          where: { status: 1 }, // 1 = approved
          orderBy: { submittedAt: 'desc' },
          take: 5
        },
      }
    });

    if (!region) {
      return Response.json({ error: 'Region not found' }, { status: 404 });
    }

    return Response.json(region);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
