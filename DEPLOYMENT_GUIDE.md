# Deploying ZeroState

This guide covers deploying ZeroState to production.

## Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy ZeroState. It's free for personal projects and handles everything automatically.

### Option 1: GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click **"New Project"**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   In the Vercel dashboard, add these:
   ```
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=zerostate
   NEXT_PUBLIC_GROUP_ID=network-school-2024
   NEXT_PUBLIC_MERKLE_TREE_DEPTH=20
   ```

4. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

Follow the prompts and add environment variables when asked.

## Environment Variables

Make sure these are set in your deployment platform:

- `MONGODB_URI` - Your MongoDB Atlas connection string
- `MONGODB_DB_NAME` - Database name (usually `zerostate`)
- `NEXT_PUBLIC_GROUP_ID` - Your group identifier
- `NEXT_PUBLIC_MERKLE_TREE_DEPTH` - Merkle tree depth (default: 20)

## MongoDB Atlas Production Setup

For production, make these changes:

1. **Network Access**: Use specific IPs instead of 0.0.0.0/0
   - Add Vercel's IP ranges or use MongoDB Atlas IP Access List
   - Or keep 0.0.0.0/0 but use strong database passwords

2. **Database User**: Create a user with limited permissions
   - Don't use "Atlas admin" in production
   - Create a user with read/write access only

3. **Enable Backups**: Set up automated backups in Atlas

4. **Monitoring**: Enable Atlas monitoring and alerts

## Other Deployment Options

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables in Netlify dashboard

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### VPS (DigitalOcean, AWS, etc.)

```bash
# SSH into server
git clone <your-repo>
cd zerostate
npm install
npm run build

# Use PM2 to keep it running
npm install -g pm2
pm2 start npm --name "zerostate" -- start
pm2 save
pm2 startup
```

## Post-Deployment Checklist

- [ ] Test registration flow
- [ ] Test feedback submission
- [ ] Verify MongoDB connection works
- [ ] Check admin dashboard
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring (optional)

## Performance Tips

- MongoDB Atlas free tier handles ~1000 members easily
- For larger communities, upgrade to paid tier
- Enable MongoDB indexes for better query performance
- Use Vercel's edge network for faster global access

## Security Checklist

- [ ] Strong MongoDB database passwords
- [ ] Environment variables not exposed in client code
- [ ] Network access restricted (production)
- [ ] Regular backups enabled
- [ ] Monitor for unusual activity

---

Your ZeroState instance is now live! Share it with your community and start collecting honest feedback.
