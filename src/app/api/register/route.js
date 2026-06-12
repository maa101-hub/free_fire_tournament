import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

const registerSchema = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
  type: z.enum(['solo', 'duo', 'squad']),
  teamName: z.string().optional(),
  captainName: z.string().min(3, "Name is too short"),
  uid: z.string().min(5, "Invalid Free Fire UID").max(15, "Invalid Free Fire UID"),
  phone: z.string().min(10, "Invalid Phone Number"),
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const body = await req.json();
    
    // Zod Validation
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { tournamentId, type, teamName, captainName, uid, phone } = validation.data;

    if (type !== 'solo' && (!teamName || teamName.length < 3)) {
      return NextResponse.json({ error: 'Valid Team name is required for Duo/Squad' }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    if (tournament.status !== 'OPEN') {
      return NextResponse.json({ error: 'Tournament registration is closed' }, { status: 400 });
    }

    // Save registration
    const registration = await prisma.registration.create({
      data: {
        userId: session.user.id,
        tournamentId: tournament.id,
        type,
        teamName,
        captainName,
        uid,
        phone,
        paymentProofUrl: body.paymentProofUrl || 'pending-upload',
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, registration }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
