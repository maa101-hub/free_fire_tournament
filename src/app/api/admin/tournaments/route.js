import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tournaments = await prisma.tournament.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ success: true, tournaments });
  } catch (error) {
    console.error('Fetch Tournaments Error:', error);
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
    const { title, type, entryFee, prizePool, totalSlots, scheduledDate } = body;

    if (!title || !type || entryFee === undefined || prizePool === undefined || !totalSlots || !scheduledDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tournament = await prisma.tournament.create({
      data: {
        title,
        type,
        entryFee: parseFloat(entryFee),
        prizePool: parseFloat(prizePool),
        totalSlots: parseInt(totalSlots),
        scheduledDate: new Date(scheduledDate),
        status: 'OPEN'
      }
    });

    return NextResponse.json({ success: true, tournament }, { status: 201 });
  } catch (error) {
    console.error('Create Tournament Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, roomId, roomPassword } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing tournament ID' }, { status: 400 });
    }

    const updated = await prisma.tournament.update({
      where: { id },
      data: { roomId, roomPassword }
    });

    return NextResponse.json({ success: true, tournament: updated });
  } catch (error) {
    console.error('Update Tournament Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
