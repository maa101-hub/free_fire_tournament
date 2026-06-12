import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    const registrations = await prisma.registration.findMany({
      where: { uid },
      include: {
        tournament: {
          select: { title: true, type: true, scheduledDate: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const matchResults = await prisma.matchResult.findMany({
      where: { uid },
      include: {
        tournament: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, registrations, matchResults });
  } catch (error) {
    console.error('Fetch Player Dashboard Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
