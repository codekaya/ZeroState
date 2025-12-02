import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/lib/models/Feedback';
import Reply from '@/lib/models/Reply';
import { feedbackToFrontend } from '@/lib/db-helpers';

export async function GET() {
  try {
    await connectDB();

    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .populate('authorId', 'name')
      .lean();

    // Get reply counts for each feedback
    const feedbackIds = feedbacks.map((f: any) => f._id);
    const replyCounts = await Reply.aggregate([
      { $match: { feedbackId: { $in: feedbackIds } } },
      { $group: { _id: '$feedbackId', count: { $sum: 1 } } },
    ]);

    const countsMap: { [key: string]: number } = {};
    replyCounts.forEach((item: any) => {
      countsMap[item._id.toString()] = item.count;
    });

    const feedbacksWithCounts = feedbacks.map((fb: any) => {
      const authorName = fb.authorId?.name;
      const feedback = feedbackToFrontend(fb as any, authorName);
      return {
        ...feedback,
        replies_count: countsMap[fb._id.toString()] || 0,
      };
    });

    return NextResponse.json({ feedbacks: feedbacksWithCounts });
  } catch (error: any) {
    console.error('Error fetching admin feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

