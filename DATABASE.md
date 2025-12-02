# Database Schema

ZeroState uses MongoDB Atlas for data storage. This document explains the database structure.

## Collections

### Members

Stores registered members and their identity commitments.

```typescript
{
  _id: ObjectId
  name: string
  email: string (unique, indexed)
  identityCommitment: string (unique, indexed)
  joinedAt: Date
  status: 'active' | 'inactive' (indexed)
  attributes?: {
    skills?: string[]
    location?: string
    ageRange?: string
  }
}
```

**Indexes:**
- `email` (unique)
- `identityCommitment` (unique)
- `status`

### Feedback

Community feedback posts.

```typescript
{
  _id: ObjectId
  content: string (max 500 chars)
  category: 'facilities' | 'food' | 'events' | 'community' | 'ideas' (indexed)
  isAnonymous: boolean
  authorNullifier?: string (indexed)
  authorId?: ObjectId (ref to Member, indexed)
  zkProof: object
  status: 'open' | 'in_progress' | 'resolved' (indexed)
  upvotes: number
  createdAt: Date (indexed, descending)
  updatedAt: Date
}
```

**Indexes:**
- `category`
- `status`
- `createdAt` (descending)
- `authorNullifier`
- `authorId`

### Replies

Replies to feedback posts.

```typescript
{
  _id: ObjectId
  feedbackId: ObjectId (ref to Feedback, indexed)
  content: string (max 300 chars)
  isAnonymous: boolean
  authorNullifier?: string (indexed)
  authorId?: ObjectId (ref to Member)
  zkProof: object
  createdAt: Date (indexed)
}
```

**Indexes:**
- `feedbackId`
- `authorNullifier`
- `createdAt`

### Upvotes

Tracks upvotes with nullifiers to prevent double-voting.

```typescript
{
  _id: ObjectId
  feedbackId: ObjectId (ref to Feedback, indexed)
  nullifier: string (indexed)
  createdAt: Date
}
```

**Indexes:**
- `feedbackId` + `nullifier` (compound unique)
- `nullifier`

### Census Snapshots

Historical population analytics data.

```typescript
{
  _id: ObjectId
  timestamp: Date (indexed, descending)
  totalMembers: number
  activeMembers: number
  merkleRoot: string (indexed)
  demographics: {
    ageRanges?: { [range: string]: number }
    locations?: { [location: string]: number }
    skills?: { [skill: string]: number }
  }
  zkProof?: object
}
```

**Indexes:**
- `timestamp` (descending)
- `merkleRoot`

## Setup

MongoDB collections are created automatically when you first insert data. No manual schema creation needed!

The Mongoose models in `lib/models/` handle:
- Schema validation
- Index creation
- Type safety

## Indexes

All indexes are created automatically by Mongoose when the app starts. For production, you can also create them manually in MongoDB Atlas for better performance.

## Data Relationships

- **Feedback** → **Member** (via `authorId`, optional)
- **Reply** → **Feedback** (via `feedbackId`, required)
- **Reply** → **Member** (via `authorId`, optional)
- **Upvote** → **Feedback** (via `feedbackId`, required)

## Privacy Notes

- `identityCommitment` is public (used for ZK proofs)
- `identitySecret` is NEVER stored (only in browser localStorage)
- Anonymous posts use `authorNullifier` instead of `authorId`
- Demographics are aggregated anonymously

---

The database is designed to be simple, flexible, and privacy-preserving.
