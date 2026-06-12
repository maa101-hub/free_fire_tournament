import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tournamentId, results } = body;

    if (!tournamentId || !results || !Array.isArray(results)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // 1. Calculate Scores and Sort
    // Booyah (1st place) = 12 points. Kills = 1 point each.
    const BOOYAH_POINTS = 12;

    const scoredResults = results.map(r => {
      const placementScore = parseInt(r.placement) === 1 ? BOOYAH_POINTS : 0;
      const killScore = parseInt(r.kills);
      return {
        ...r,
        kills: killScore,
        placement: parseInt(r.placement),
        totalScore: killScore + placementScore,
        isQualified: false
      };
    });

    // Sort by Total Score DESC, then Kills DESC
    scoredResults.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return b.kills - a.kills;
    });

    // Top 8 qualify
    const finalResults = scoredResults.map((r, index) => ({
      ...r,
      isQualified: index < 8
    }));

    // 2. Database Transaction
    // Delete old results for this tournament and insert new ones
    await prisma.$transaction(async (tx) => {
      await tx.matchResult.deleteMany({
        where: { tournamentId }
      });

      await tx.matchResult.createMany({
        data: finalResults.map(r => ({
          tournamentId,
          teamName: r.teamName,
          uid: r.uid,
          kills: r.kills,
          placement: r.placement,
          totalScore: r.totalScore,
          isQualified: r.isQualified
        }))
      });
      
      // Update tournament status to CLOSED since results are published
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { status: 'CLOSED' }
      });
    });

    return NextResponse.json({ success: true, message: 'Results published and leaderboard calculated.' });

  } catch (error) {
    console.error('Publish Results Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
