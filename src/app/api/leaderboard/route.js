import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
    }

    const results = await prisma.matchResult.findMany({
      where: { tournamentId },
      orderBy: [
        { totalScore: 'desc' },
        { kills: 'desc' },
        { createdAt: 'asc' }
      ]
    });
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Fetch Leaderboard Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
