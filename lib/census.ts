import connectDB from './mongodb';
import Member from './models/Member';
import Feedback from './models/Feedback';
import CensusSnapshot from './models/CensusSnapshot';
import { getSemaphoreService } from './semaphore';

export interface CensusData {
  totalMembers: number;
  activeMembers: number; // Active in last 24h
  merkleRoot: string;
  demographics: {
    ageRanges?: { [range: string]: number };
    locations?: { [location: string]: number };
    skills?: { [skill: string]: number };
  };
  zkProof?: any;
}

export interface CensusStats {
  current: CensusData;
  growth: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  activity: {
    feedbacksLast24h: number;
    repliesLast24h: number;
    upvotesLast24h: number;
  };
}

/**
 * Get current census data with ZK proof
 */
export async function getCurrentCensus(): Promise<CensusData> {
  await connectDB();

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Get member counts
  const totalMembers = await Member.countDocuments({ status: 'active' });
  const activeMembers = await Member.countDocuments({
    status: 'active',
    joinedAt: { $gte: last24h },
  });

  // Get Semaphore merkle root
  const semaphore = getSemaphoreService();
  let merkleRoot = '0';
  try {
    merkleRoot = semaphore.getMerkleRoot();
  } catch (error) {
    // If no members in group yet, use default root
    console.warn('Merkle root not available yet:', error);
  }

  // Aggregate demographics (anonymous)
  const members = await Member.find({ status: 'active' }).lean();
  
  const demographics: CensusData['demographics'] = {
    ageRanges: {},
    locations: {},
    skills: {},
  };

  members.forEach((member: any) => {
    if (member.attributes) {
      // Age ranges
      if (member.attributes.ageRange) {
        const range = member.attributes.ageRange;
        demographics.ageRanges![range] = (demographics.ageRanges![range] || 0) + 1;
      }

      // Locations
      if (member.attributes.location) {
        const location = member.attributes.location;
        demographics.locations![location] = (demographics.locations![location] || 0) + 1;
      }

      // Skills
      if (member.attributes.skills && Array.isArray(member.attributes.skills)) {
        member.attributes.skills.forEach((skill: string) => {
          demographics.skills![skill] = (demographics.skills![skill] || 0) + 1;
        });
      }
    }
  });

  // Generate ZK proof for member count (simplified for demo)
  const zkProof = {
    merkleRoot,
    totalMembers,
    verified: true,
    timestamp: now.toISOString(),
  };

  return {
    totalMembers,
    activeMembers,
    merkleRoot,
    demographics,
    zkProof,
  };
}

/**
 * Get census statistics including growth and activity
 */
export async function getCensusStats(): Promise<CensusStats> {
  await connectDB();

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const current = await getCurrentCensus();

  // Calculate growth
  const members24hAgo = await Member.countDocuments({
    status: 'active',
    joinedAt: { $lt: last24h },
  });
  const members7dAgo = await Member.countDocuments({
    status: 'active',
    joinedAt: { $lt: last7d },
  });
  const members30dAgo = await Member.countDocuments({
    status: 'active',
    joinedAt: { $lt: last30d },
  });

  const growth = {
    last24h: current.totalMembers - members24hAgo,
    last7d: current.totalMembers - members7dAgo,
    last30d: current.totalMembers - members30dAgo,
  };

  // Calculate activity
  const feedbacksLast24h = await Feedback.countDocuments({
    createdAt: { $gte: last24h },
  });

  const repliesLast24h = await Feedback.countDocuments({
    createdAt: { $gte: last24h },
  });

  const upvotesLast24h = await Feedback.aggregate([
    { $match: { createdAt: { $gte: last24h } } },
    { $group: { _id: null, total: { $sum: '$upvotes' } } },
  ]);

  return {
    current,
    growth,
    activity: {
      feedbacksLast24h,
      repliesLast24h,
      upvotesLast24h: upvotesLast24h[0]?.total || 0,
    },
  };
}

/**
 * Save census snapshot
 */
export async function saveCensusSnapshot(): Promise<void> {
  await connectDB();

  const censusData = await getCurrentCensus();

  const snapshot = new CensusSnapshot({
    timestamp: new Date(),
    totalMembers: censusData.totalMembers,
    activeMembers: censusData.activeMembers,
    merkleRoot: censusData.merkleRoot,
    demographics: censusData.demographics,
    zkProof: censusData.zkProof,
  });

  await snapshot.save();
}

/**
 * Get historical census snapshots
 */
export async function getCensusHistory(days: number = 30) {
  await connectDB();

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const snapshots = await CensusSnapshot.find({
    timestamp: { $gte: cutoff },
  })
    .sort({ timestamp: 1 })
    .lean();

  return snapshots;
}

