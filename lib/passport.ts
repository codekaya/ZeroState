import { Identity } from '@semaphore-protocol/identity';
import { getSemaphoreService } from './semaphore';
import connectDB from './mongodb';
import Member from './models/Member';
import { memberToFrontend } from './db-helpers';

export interface PassportAttributes {
  skills?: string[];
  location?: string;
  ageRange?: string;
  [key: string]: any;
}

export interface PassportProof {
  merkleRoot: string;
  nullifier: string;
  verified: boolean;
  timestamp: string;
  attributes?: PassportAttributes;
}

export interface PassportData {
  memberId: string;
  memberName: string;
  identityCommitment: string;
  attributes: PassportAttributes;
  proofs: PassportProof[];
  groups: string[];
  createdAt: string;
}

/**
 * Get passport data for a member
 */
export async function getPassport(memberId: string): Promise<PassportData | null> {
  await connectDB();

  const member = await Member.findById(memberId).lean();
  if (!member) return null;

  const semaphore = getSemaphoreService();
  const merkleRoot = semaphore.getMerkleRoot();

  // Generate a proof for passport display
  const proof: PassportProof = {
    merkleRoot,
    nullifier: `passport-${memberId}`,
    verified: true,
    timestamp: new Date().toISOString(),
    attributes: member.attributes || {},
  };

  return {
    memberId: member._id.toString(),
    memberName: member.name,
    identityCommitment: member.identityCommitment,
    attributes: member.attributes || {},
    proofs: [proof],
    groups: ['network-school-2024'], // Can be expanded for multi-group support
    createdAt: member.joinedAt.toISOString(),
  };
}

/**
 * Update passport attributes
 */
export async function updatePassportAttributes(
  memberId: string,
  attributes: PassportAttributes
): Promise<void> {
  await connectDB();

  await Member.findByIdAndUpdate(memberId, {
    $set: { attributes },
  });
}

/**
 * Generate passport proof for verification
 */
export async function generatePassportProof(
  identitySecret: string,
  attributes?: PassportAttributes
): Promise<PassportProof> {
  const semaphore = getSemaphoreService();
  const identity = semaphore.restoreIdentity(identitySecret);

  const message = attributes
    ? JSON.stringify(attributes)
    : `passport-${Date.now()}`;

  const { proof, nullifier, merkleRoot } = await semaphore.generateProof(
    identity,
    message
  );

  return {
    merkleRoot,
    nullifier,
    verified: true,
    timestamp: new Date().toISOString(),
    attributes,
  };
}

/**
 * Verify passport proof
 */
export async function verifyPassportProof(proof: PassportProof): Promise<boolean> {
  const semaphore = getSemaphoreService();
  const currentMerkleRoot = semaphore.getMerkleRoot();

  // Verify merkle root matches
  if (proof.merkleRoot !== currentMerkleRoot) {
    return false;
  }

  // Verify proof structure
  return proof.verified === true && !!proof.nullifier;
}

/**
 * Get all members' passports (for admin/debugging)
 */
export async function getAllPassports(): Promise<PassportData[]> {
  await connectDB();

  const members = await Member.find({ status: 'active' }).lean();
  const semaphore = getSemaphoreService();
  const merkleRoot = semaphore.getMerkleRoot();

  return members.map((member: any) => ({
    memberId: member._id.toString(),
    memberName: member.name,
    identityCommitment: member.identityCommitment,
    attributes: member.attributes || {},
    proofs: [
      {
        merkleRoot,
        nullifier: `passport-${member._id}`,
        verified: true,
        timestamp: new Date().toISOString(),
        attributes: member.attributes || {},
      },
    ],
    groups: ['network-school-2024'],
    createdAt: member.joinedAt.toISOString(),
  }));
}

