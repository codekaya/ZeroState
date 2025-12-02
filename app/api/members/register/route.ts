import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/lib/models/Member';
import { memberToFrontend } from '@/lib/db-helpers';
import { getSemaphoreService } from '@/lib/semaphore';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, identityCommitment } = body;

    if (!name || !email || !identityCommitment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Check if identity commitment already exists
    const existingIdentity = await Member.findOne({ identityCommitment });
    if (existingIdentity) {
      return NextResponse.json({ error: 'Identity already registered' }, { status: 400 });
    }

    // Create member
    const member = new Member({
      name,
      email,
      identityCommitment,
      status: 'active',
    });

    await member.save();

    // Add to Semaphore group (server-side)
    try {
      const semaphore = getSemaphoreService();
      semaphore.addMember(identityCommitment);
    } catch (error) {
      console.warn('Failed to add member to Semaphore group:', error);
      // Don't fail registration if Semaphore group update fails
    }

    return NextResponse.json({ member: memberToFrontend(member) }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering member:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email or identity already registered' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

