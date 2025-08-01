
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const region = await Promise.all([prisma.region.findMany({
      include: {
        detail: true,
        classification: true,
        reports: {
          where: { status: 1 }, // 1 = approved
          orderBy: { submittedAt: 'desc' },
          take: 5
        },
      }
    })]);

    if (!region) {
      return Response.json({ error: 'Region not found' }, { status: 404 });
    }

    return Response.json(region);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
