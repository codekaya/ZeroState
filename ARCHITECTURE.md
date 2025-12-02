# ZeroState Architecture

This document explains how ZeroState works under the hood.

## Overview

ZeroState is built on Next.js 14 with MongoDB for data storage and Semaphore Protocol for zero-knowledge proofs. The architecture is designed to be simple, scalable, and privacy-first.

## System Architecture

```
┌─────────────────────────────────────┐
│         Client (Browser)            │
│  ┌──────────┐  ┌──────────┐        │
│  │ Next.js  │  │ Semaphore│        │
│  │   UI     │  │   JS     │        │
│  └────┬─────┘  └────┬─────┘        │
│       └──────┬──────┘               │
│              │ HTTPS                │
└──────────────┼─────────────────────┘
               │
┌──────────────┼─────────────────────┐
│         Server (Vercel)             │
│              │                      │
│       ┌──────▼──────┐              │
│       │ Next.js API │              │
│       │   Routes    │              │
│       └──────┬──────┘              │
│              │                      │
│       ┌──────▼──────┐              │
│       │   MongoDB   │              │
│       │    Atlas   │              │
│       └─────────────┘              │
└─────────────────────────────────────┘
```

## Core Components

### Frontend (Next.js App Router)

- **Pages**: Home feed, registration, feedback submission, admin dashboard
- **Components**: Reusable UI components built with Tailwind CSS
- **State**: Zustand for client-side state management
- **ZK Proofs**: Generated client-side using Semaphore Protocol

### Backend (API Routes)

- **MongoDB Connection**: Handled via Mongoose ODM
- **Data Models**: Member, Feedback, Reply, Upvote, CensusSnapshot
- **API Endpoints**: RESTful routes for all operations
- **Proof Verification**: Server-side verification of ZK proofs

### Database (MongoDB Atlas)

- **Members**: User identities and commitments
- **Feedback**: Community feedback posts
- **Replies**: Responses to feedback
- **Upvotes**: Voting records with nullifiers
- **Census Snapshots**: Population analytics data

## Zero-Knowledge Flow

### Registration

1. User enters name and email
2. Client generates Semaphore identity (secret stays local)
3. Identity commitment sent to server
4. Server saves to MongoDB
5. Server adds commitment to Semaphore group
6. Identity secret stored in browser localStorage

### Anonymous Feedback Submission

1. User writes feedback
2. Client restores identity from localStorage
3. Client syncs Semaphore group (loads all members from DB)
4. Client generates ZK proof: "I'm a verified member"
5. Proof includes nullifier (unique anonymous ID)
6. Server verifies proof structure
7. Feedback saved to MongoDB with nullifier
8. Feedback displayed anonymously

### Public Feedback Submission

Same flow as anonymous, but includes `authorId` so name can be displayed.

## Data Models

### Member

```typescript
{
  _id: ObjectId
  name: string
  email: string (unique)
  identityCommitment: string (unique)
  joinedAt: Date
  status: 'active' | 'inactive'
  attributes?: {
    skills?: string[]
    location?: string
    ageRange?: string
  }
}
```

### Feedback

```typescript
{
  _id: ObjectId
  content: string (max 500 chars)
  category: 'facilities' | 'food' | 'events' | 'community' | 'ideas'
  isAnonymous: boolean
  authorNullifier?: string
  authorId?: ObjectId (ref to Member)
  zkProof: object
  status: 'open' | 'in_progress' | 'resolved'
  upvotes: number
  createdAt: Date
  updatedAt: Date
}
```

### Reply

```typescript
{
  _id: ObjectId
  feedbackId: ObjectId (ref to Feedback)
  content: string (max 300 chars)
  isAnonymous: boolean
  authorNullifier?: string
  authorId?: ObjectId (ref to Member)
  zkProof: object
  createdAt: Date
}
```

### Upvote

```typescript
{
  _id: ObjectId
  feedbackId: ObjectId (ref to Feedback)
  nullifier: string (unique per feedback)
  createdAt: Date
}
```

## Privacy Guarantees

### What's Protected

- **Anonymous Posts**: Cannot be traced back to users
- **Identity Secrets**: Never leave the browser
- **Nullifiers**: Unique but unlinkable to identity
- **Demographics**: Aggregated anonymously

### What's Not Protected

- Database admin can see member list (by design for moderation)
- Public posts show user names (user choice)
- Identity loss requires re-registration

## Security Model

### Threat Protection

- ✅ **Spam/Bots**: Only verified members can post
- ✅ **Sybil Attacks**: One identity per member enforced
- ✅ **Double Voting**: Nullifiers prevent duplicate upvotes
- ✅ **Identity Linking**: Anonymous posts cryptographically unlinkable

### Limitations

- Merkle tree is centralized (admin controls membership)
- ZK proof generation takes 2-5 seconds
- Identity loss = need to re-register

## Performance Considerations

### Current Capacity

- **Members**: Up to 1,048,576 (2^20 merkle tree)
- **Feedback**: Unlimited (add pagination at 1000+)
- **Database**: MongoDB Atlas free tier (512MB)

### Optimization Opportunities

- Use Web Workers for ZK proof generation
- Implement proof caching
- Add database indexes for common queries
- Use MongoDB aggregation for analytics

## Scaling Strategy

1. **Small (< 100 members)**: Current setup works perfectly
2. **Medium (100-1000)**: Add pagination, optimize queries
3. **Large (1000+)**: Consider proof caching, CDN, read replicas
4. **Very Large (10,000+)**: May need faster ZK library or proof batching

## Technology Choices

### Why Next.js?

- Server and client in one codebase
- Great performance with App Router
- Built-in API routes
- Easy Vercel deployment

### Why MongoDB?

- Flexible schema for evolving features
- Easy to scale with Atlas
- Good free tier
- Simple queries

### Why Semaphore?

- Battle-tested ZK protocol
- JavaScript implementation
- Active community
- Good documentation

---

This architecture balances simplicity, privacy, and scalability for network states of all sizes.
