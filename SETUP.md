# Setting Up ZeroState

This guide will get you up and running with ZeroState in about 10 minutes.

## Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

## Step 2: Set Up MongoDB Atlas (5 minutes)

### Create Your Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up (it's free)
2. Click **"Build a Database"**
3. Choose the **free M0 tier**
4. Pick a cloud provider and region (choose the one closest to you)
5. Name your cluster (e.g., `zerostate-cluster`)
6. Click **"Create"** and wait 2-3 minutes

### Create Database User

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username and strong password (save these!)
5. Set privileges to **"Atlas admin"** (for development)
6. Click **"Add User"**

### Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, use specific IPs instead
4. Click **"Confirm"**

### Get Your Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like `mongodb+srv://...`)
5. Replace `<username>` and `<password>` with your database user credentials

## Step 3: Configure Environment (1 minute)

Create `.env.local` in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=zerostate

NEXT_PUBLIC_GROUP_ID=network-school-2024
NEXT_PUBLIC_MERKLE_TREE_DEPTH=20
NEXT_PUBLIC_ADMIN_EMAIL=admin@yournetwork.com
```

## Step 4: Run the App (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you should see ZeroState!

## Step 5: Test It Out (2 minutes)

1. Click **"Get Started"** or **"Register"**
2. Enter your name and email
3. Click **"Create My Identity"**
4. You'll be redirected to the home page
5. Click **"New Feedback"**
6. Write some feedback and submit it
7. See it appear on the feed!

## Troubleshooting

### Can't Connect to MongoDB

- Double-check your connection string has the correct username/password
- Make sure you've whitelisted your IP address
- Verify your cluster is running (not paused)

### Registration Fails

- Check the browser console for errors
- Make sure MongoDB connection string is correct
- Try restarting the dev server after changing `.env.local`

### ZK Proof Generation Takes Time

- This is normal! ZK proofs take 2-5 seconds to generate
- You'll see a loading indicator during proof generation
- The first proof after server restart might take longer (group sync)

## Next Steps

- Customize the branding for your network state
- Invite your community members
- Set up admin accounts
- Deploy to production (see `DEPLOYMENT_GUIDE.md`)

---

That's it! You're ready to start collecting anonymous feedback from your community.
