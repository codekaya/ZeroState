import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import Member first to ensure it's registered before populate
import Member from '@/lib/models/Member';
import Reply from '@/lib/models/Reply';
import { replyToFrontend } from '@/lib/db-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { content, isAnonymous, authorNullifier, authorId, zkProof } = body;

    if (!content || !zkProof) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reply = new Reply({
      feedbackId: id,
      content,
      isAnonymous: isAnonymous ?? true,
      authorNullifier: isAnonymous ? authorNullifier : null,
      authorId: !isAnonymous && authorId ? authorId : null,
      zkProof,
    });

    await reply.save();

    const populatedReply = await Reply.findById(reply._id)
      .populate('authorId', 'name')
      .lean();

    const authorName = (populatedReply as any)?.authorId?.name;
    return NextResponse.json(
      { reply: replyToFrontend(populatedReply as any, authorName) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

