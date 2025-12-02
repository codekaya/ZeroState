# ZeroState

ZeroState is an anonymous feedback forum for network states, powered by zero-knowledge proofs to verify members without revealing their identities.

## What is ZeroState?

ZeroState solves a real problem for startup societies and network states: how do you collect honest community feedback when people are afraid to speak up? Traditional forums either require real names (which discourages honest feedback) or allow anonymous posting (which gets flooded with spam and fake accounts).

ZeroState uses zero-knowledge cryptography to solve both problems. Members are cryptographically verified as real members of your community, but their identities stay completely private. You get honest feedback without spam, and members get privacy without fear.

## Features

- **Anonymous Feedback**: Share feedback without revealing your identity
- **Public Option**: Choose to post with your name when you want
- **Zero-Knowledge Verification**: Every post is cryptographically verified to be from a real member
- **No Spam**: Sybil-resistant by design—one person, one identity
- **Population Analytics**: Built-in privacy-preserving census features
- **Category Organization**: Organize feedback by Facilities, Food, Events, Community, and Ideas
- **Real-time Interaction**: Upvote and reply to feedback
- **Admin Dashboard**: Track and manage community feedback

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Database**: MongoDB Atlas
- **ZK Protocol**: Semaphore Protocol
- **Styling**: Tailwind CSS with modern glassmorphism design
- **State**: Zustand
- **Deployment**: Vercel-ready

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works great)
- Git

### Installation

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd zerostate
   npm install
   ```

2. **Set up MongoDB Atlas**
   - Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string
   - See `SETUP.md` for detailed instructions

3. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=zerostate
   ```

4. **Run it**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## How It Works

### For Members

1. **Register**: Create your anonymous identity with zero-knowledge proofs
2. **Share Feedback**: Post anonymously or publicly—your choice
3. **Interact**: Upvote and reply to feedback from other verified members

### For Admins

1. **Monitor**: View all feedback and community insights
2. **Respond**: Update feedback status and engage with members
3. **Analytics**: See population stats and engagement metrics

## Privacy & Security

- **Identity Secrets**: Stored locally on your device, never sent to servers
- **ZK Proofs**: Cryptographic verification without revealing who you are
- **Nullifiers**: Prevent double-voting while maintaining anonymity
- **No Tracking**: Anonymous posts cannot be traced back to users

## Project Structure

```
zerostate/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/              # Core logic (MongoDB, Semaphore, etc.)
└── public/           # Static assets
```

## Deployment

Deploy to Vercel in minutes:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Check code quality
```

## License

MIT License - use it for your network state!

## Support

- Check `SETUP.md` for setup help
- Check `ARCHITECTURE.md` for technical details
- Open a GitHub issue for bugs

---

Built for privacy-first communities and network states.
