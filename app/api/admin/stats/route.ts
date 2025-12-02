import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/lib/models/Member';
import Feedback from '@/lib/models/Feedback';

export async function GET() {
  try {
    await connectDB();

    const totalMembers = await Member.countDocuments({ status: 'active' });
    const totalFeedback = await Feedback.countDocuments();
    const openIssues = await Feedback.countDocuments({ status: 'open' });
    
    // Count feedback from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentFeedback = await Feedback.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });

    return NextResponse.json({
      totalMembers,
      totalFeedback,
      openIssues,
      recentFeedback,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
