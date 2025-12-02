/**
 * Server-side Semaphore helpers
 * Only import this in API routes or server components
 */
import connectDB from './mongodb';
import Member from './models/Member';
import { getSemaphoreService } from './semaphore';

/**
 * Rebuild Semaphore group from MongoDB members
 * Call this before generating proofs to ensure group is up-to-date
 * SERVER-SIDE ONLY
 */
export async function rebuildSemaphoreGroup(): Promise<void> {
  try {
    await connectDB();
    const members = await Member.find({ status: 'active' }).select('identityCommitment').lean();
    
    const commitments = members.map((m: any) => m.identityCommitment);
    const semaphore = getSemaphoreService();
    await semaphore.rebuildGroup(commitments);
    
    console.log(`✅ Rebuilt Semaphore group with ${commitments.length} members`);
  } catch (error) {
    console.error('Error rebuilding Semaphore group:', error);
    throw error;
  }
}

