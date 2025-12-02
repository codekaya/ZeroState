import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/lib/models/Feedback';
import Upvote from '@/lib/models/Upvote';
import { toObjectId } from '@/lib/db-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { nullifier } = body;

    if (!nullifier) {
      return NextResponse.json({ error: 'Nullifier required' }, { status: 400 });
    }

    // Check if already upvoted
    const existingUpvote = await Upvote.findOne({
      feedbackId: id,
      nullifier,
    });

    if (existingUpvote) {
      return NextResponse.json({ error: 'Already upvoted' }, { status: 400 });
    }

    // Create upvote
    const upvote = new Upvote({
      feedbackId: id,
      nullifier,
    });

    await upvote.save();

    // Increment upvotes count
    await Feedback.findByIdAndUpdate(id, { $inc: { upvotes: 1 } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error upvoting:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Already upvoted' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

