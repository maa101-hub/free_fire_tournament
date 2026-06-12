import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const registrations = await prisma.registration.findMany({
      where: { userId },
      include: {
        tournament: {
          select: { title: true, scheduledDate: true, roomId: true, roomPassword: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Also fetch match results for this user by matching their UID across registrations
    // Wait, the easiest way is to find MatchResults where the uid matches one of their registrations.
    // Let's get all unique UIDs this user has used.
    const uniqueUids = [...new Set(registrations.map(r => r.uid))];

    const matchResults = await prisma.matchResult.findMany({
      where: { uid: { in: uniqueUids } },
      include: {
        tournament: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, registrations, matchResults });
  } catch (error) {
    console.error('User Dashboard Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
