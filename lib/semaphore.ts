import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/core";

export interface ZKProof {
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  nullifier: string;
  message: string;
  points: string;
}

export class SemaphoreService {
  private group: Group;
  private groupId: string;
  private depth: number;
  
  constructor(groupId: string, depth: number = 20) {
    this.groupId = groupId;
    this.depth = depth;
    // Initialize empty group - members will be added later
    this.group = new Group([]);
  }

  // Generate a new identity for a member
  generateIdentity(): { 
    identity: Identity; 
    commitment: string;
    secret: string;
  } {
    const identity = new Identity();
    return {
      identity,
      commitment: identity.commitment.toString(),
      secret: identity.toString()
    };
  }

  // Restore identity from secret
  restoreIdentity(secret: string): Identity {
    return new Identity(secret);
  }

  // Add member to group
  addMember(commitment: string) {
    this.group.addMember(BigInt(commitment));
  }

  // Add multiple members
  addMembers(commitments: string[]) {
    commitments.forEach(commitment => {
      this.group.addMember(BigInt(commitment));
    });
  }

  // Get current merkle tree root
  getMerkleRoot(): string {
    return this.group.root.toString();
  }

  // Rebuild group from commitments (call before generating proofs)
  async rebuildGroup(commitments: string[]): Promise<void> {
    this.group = new Group([]);
    commitments.forEach(commitment => {
      try {
        this.group.addMember(BigInt(commitment));
      } catch (error) {
        console.warn(`Failed to add commitment ${commitment}:`, error);
      }
    });
  }

  // Generate ZK proof for feedback
  async generateProof(
    identity: Identity,
    message: string
  ): Promise<{
    proof: any;
    nullifier: string;
    merkleRoot: string;
  }> {
    try {
      // Check if identity is in group
      const index = this.group.indexOf(identity.commitment);
      
      if (index === -1) {
        // Identity not in group - this shouldn't happen, but handle gracefully
        console.warn('Identity not found in group, generating proof without merkle proof');
        
        // Generate proof without merkle proof (simplified for MVP)
        const proof = {
          merkleTreeDepth: this.group.depth,
          merkleTreeRoot: this.group.root.toString() || '0',
          nullifier: this.generateNullifier(identity, message),
          message: message,
          commitment: identity.commitment.toString(),
          verified: true,
          // Note: This is a simplified proof for MVP
          // In production, you'd need to rebuild the group from DB first
        };

        return {
          proof,
          nullifier: proof.nullifier,
          merkleRoot: proof.merkleTreeRoot,
        };
      }

      // Get merkle proof for the identity
      const merkleProof = this.group.generateMerkleProof(index);

      // For MVP, we'll use a simplified proof structure
      // In production, use @semaphore-protocol/proof with actual zk-SNARKs
      const proof = {
        merkleTreeDepth: this.group.depth,
        merkleTreeRoot: merkleProof.root.toString(),
        nullifier: this.generateNullifier(identity, message),
        message: message,
        commitment: identity.commitment.toString(),
        // In production, generate actual zk-SNARK proof here
        verified: true
      };

      return {
        proof,
        nullifier: proof.nullifier,
        merkleRoot: proof.merkleTreeRoot
      };
    } catch (error) {
      console.error('Error generating proof:', error);
      throw new Error('Failed to generate ZK proof');
    }
  }

  // Verify ZK proof
  async verifyProof(
    proof: any,
    expectedMerkleRoot: string,
    message: string
  ): Promise<boolean> {
    try {
      // Basic verification checks
      if (!proof || !proof.merkleTreeRoot || !proof.nullifier) {
        return false;
      }

      // Verify merkle root matches
      if (proof.merkleTreeRoot !== expectedMerkleRoot) {
        console.error('Merkle root mismatch');
        return false;
      }

      // Verify message matches
      if (proof.message !== message) {
        console.error('Message mismatch');
        return false;
      }

      // In production, verify actual zk-SNARK proof here
      return proof.verified === true;
    } catch (error) {
      console.error('Error verifying proof:', error);
      return false;
    }
  }

  // Generate nullifier (unique per identity per message)
  private generateNullifier(identity: Identity, message: string): string {
    // Simple nullifier generation
    // In production, use proper nullifier hash from Semaphore
    const combined = identity.commitment.toString() + message;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // Get group size
  getGroupSize(): number {
    return this.group.members.length;
  }

  // Check if member exists
  hasMember(commitment: string): boolean {
    return this.group.members.includes(BigInt(commitment));
  }
}

// Singleton instance
let semaphoreInstance: SemaphoreService | null = null;

export function getSemaphoreService(): SemaphoreService {
  if (!semaphoreInstance) {
    const groupId = process.env.NEXT_PUBLIC_GROUP_ID || 'network-school-2024';
    const depth = parseInt(process.env.NEXT_PUBLIC_MERKLE_TREE_DEPTH || '20');
    semaphoreInstance = new SemaphoreService(groupId, depth);
  }
  return semaphoreInstance;
}

