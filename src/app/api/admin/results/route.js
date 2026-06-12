import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get('tournamentId');

    const where = tournamentId ? { tournamentId } : {};

    const results = await prisma.matchResult.findMany({
      where,
      include: {
        tournament: {
          select: { title: true }
        }
      },
      orderBy: [
        { totalScore: 'desc' },
        { kills: 'desc' },
        { createdAt: 'asc' }
      ]
    });
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Fetch Match Results Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tournamentId, teamName, uid, kills, placement, totalScore } = body;

    if (!tournamentId || !teamName || !uid || kills === undefined || placement === undefined || totalScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await prisma.matchResult.create({
      data: {
        tournamentId,
        teamName,
        uid,
        kills: parseInt(kills),
        placement: parseInt(placement),
        totalScore: parseInt(totalScore)
      }
    });

    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch (error) {
    console.error('Publish Match Result Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
