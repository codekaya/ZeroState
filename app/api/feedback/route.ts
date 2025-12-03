import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
// Import Member first to ensure it's registered before Feedback uses it in populate
import Member from '@/lib/models/Member';
import Feedback from '@/lib/models/Feedback';
import Reply from '@/lib/models/Reply';
import { feedbackToFrontend, replyToFrontend } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Ensure Member model is registered before populate
    if (!mongoose.models.Member) {
      await import('@/lib/models/Member');
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    // Build query
    const query: any = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    // Fetch feedbacks with replies
    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .populate('authorId', 'name')
      .lean();

    // Fetch replies for each feedback
    const feedbackIds = feedbacks.map((f: any) => f._id);
    const replies = await Reply.find({ feedbackId: { $in: feedbackIds } })
      .populate('authorId', 'name')
      .sort({ createdAt: 1 })
      .lean();

    // Group replies by feedback
    const repliesByFeedback: { [key: string]: any[] } = {};
    replies.forEach((reply: any) => {
      const feedbackId = reply.feedbackId.toString();
      if (!repliesByFeedback[feedbackId]) {
        repliesByFeedback[feedbackId] = [];
      }
      repliesByFeedback[feedbackId].push(reply);
    });

    // Convert to frontend format
    const feedbacksWithReplies = feedbacks.map((fb: any) => {
      const authorName = fb.authorId?.name;
      const feedback = feedbackToFrontend(fb as any, authorName);
      const feedbackReplies = (repliesByFeedback[fb._id.toString()] || []).map((r: any) =>
        replyToFrontend(r as any, r.authorId?.name)
      );
      return { ...feedback, replies: feedbackReplies };
    });

    return NextResponse.json({ feedbacks: feedbacksWithReplies });
  } catch (error: any) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { content, category, isAnonymous, authorNullifier, authorId, zkProof } = body;

    // Validate
    if (!content || !category || !zkProof) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create feedback
    const feedback = new Feedback({
      content,
      category,
      isAnonymous: isAnonymous ?? true,
      authorNullifier: isAnonymous ? authorNullifier : null,
      authorId: !isAnonymous && authorId ? authorId : null,
      zkProof,
      status: 'open',
      upvotes: 0,
    });

    await feedback.save();

    return NextResponse.json({ feedback: feedbackToFrontend(feedback as any) }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

