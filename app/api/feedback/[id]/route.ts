import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/lib/models/Feedback';
import Reply from '@/lib/models/Reply';
import { feedbackToFrontend, replyToFrontend, toObjectId } from '@/lib/db-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();

    const feedback = await Feedback.findById(id)
      .populate('authorId', 'name')
      .lean();

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const replies = await Reply.find({ feedbackId: id })
      .populate('authorId', 'name')
      .sort({ createdAt: 1 })
      .lean();

    const authorName = (feedback as any).authorId?.name;
    const feedbackData = feedbackToFrontend(feedback as any, authorName);
    const repliesData = replies.map((r: any) => replyToFrontend(r as any, r.authorId?.name));

    return NextResponse.json({
      feedback: feedbackData,
      replies: repliesData,
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { status } = body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    )
      .populate('authorId', 'name')
      .lean();

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const authorName = (feedback as any).authorId?.name;
    return NextResponse.json({ feedback: feedbackToFrontend(feedback as any, authorName) });
  } catch (error: any) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

