import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        status: 'OPEN'
      },
      select: {
        id: true,
        title: true,
        type: true,
        entryFee: true,
        prizePool: true,
        totalSlots: true,
        status: true,
        scheduledDate: true,
        createdAt: true
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });
    
    return NextResponse.json({ success: true, tournaments });
  } catch (error) {
    console.error('Fetch Public Tournaments Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
