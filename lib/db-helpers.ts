import { Types } from 'mongoose';
import type { IMember, IFeedback, IReply } from './models';
import type { Member, Feedback, Reply } from './store';

/**
 * Convert MongoDB Member document to frontend Member type
 */
export function memberToFrontend(member: IMember): Member {
  return {
    id: member._id.toString(),
    name: member.name,
    email: member.email,
    identity_commitment: member.identityCommitment,
    joined_at: member.joinedAt.toISOString(),
    status: member.status,
    attributes: member.attributes,
  };
}

/**
 * Convert MongoDB Feedback document to frontend Feedback type
 */
export function feedbackToFrontend(feedback: IFeedback, authorName?: string): Feedback {
  return {
    id: feedback._id.toString(),
    content: feedback.content,
    category: feedback.category,
    is_anonymous: feedback.isAnonymous,
    author_nullifier: feedback.authorNullifier || undefined,
    author_id: feedback.authorId?.toString(),
    author_name: authorName,
    zk_proof: feedback.zkProof,
    status: feedback.status,
    upvotes: feedback.upvotes,
    created_at: feedback.createdAt.toISOString(),
    updated_at: feedback.updatedAt.toISOString(),
  };
}

/**
 * Convert MongoDB Reply document to frontend Reply type
 */
export function replyToFrontend(reply: IReply, authorName?: string): Reply {
  return {
    id: reply._id.toString(),
    feedback_id: reply.feedbackId.toString(),
    content: reply.content,
    is_anonymous: reply.isAnonymous,
    author_nullifier: reply.authorNullifier || undefined,
    author_id: reply.authorId?.toString(),
    author_name: authorName,
    zk_proof: reply.zkProof,
    created_at: reply.createdAt.toISOString(),
  };
}

/**
 * Convert string ID to MongoDB ObjectId
 */
export function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}

/**
 * Check if string is valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

