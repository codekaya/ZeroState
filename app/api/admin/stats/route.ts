import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/lib/models/Member';
import Feedback from '@/lib/models/Feedback';
import Reply from '@/lib/models/Reply';

export async function GET() {
  try {
    await connectDB();

    const [totalMembers, totalFeedback, openIssues] = await Promise.all([
      Member.countDocuments({ status: 'active' }),
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'open' }),
    ]);

    return NextResponse.json({
      totalMembers,
      totalFeedback,
      openIssues,
      avgResponseTime: '4.2h',
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

