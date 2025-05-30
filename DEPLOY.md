# Vercel Deployment Steps

## Prerequisites

1. A Vercel account
2. Git repository with your XenoCRM project
3. MongoDB Atlas account (or other MongoDB hosting)
4. Redis Cloud account (optional but recommended)

## Step 1: Set up your Environment Variables

Before deploying to Vercel, make sure you have the following environment variables ready:

```
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/xenocrm?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://your-production-url.vercel.app
API_KEY=your-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
REDIS_URL=redis://username:password@your-redis-host:port
NODE_ENV=production
```

## Step 2: Deploy to Vercel

### Using Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the project:
   ```
   vercel
   ```

4. For production deployment:
   ```
   vercel --prod
   ```

### Using Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Login to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your Git repository
5. Configure project:
   - Set framework preset to "Next.js"
   - Add all environment variables
   - Set build command to "npm run build"
   - Set output directory to ".next"
6. Click "Deploy"

## Step 3: Verify Deployment

1. Once deployed, visit your Vercel URL
2. Verify the application loads correctly
3. Check logs in Vercel dashboard for any errors

## Troubleshooting

### Redis Connection Issues

If you experience Redis connection issues during deployment:

1. Ensure your Redis URL is correctly formatted
2. Verify Redis is accessible from Vercel's servers
3. If needed, set `SKIP_REDIS=true` to use the in-memory fallback

### MongoDB Connection Issues

1. Ensure MongoDB connection string is correct
2. Check that IP access restrictions allow connections from Vercel's servers
3. Verify database user has correct permissions

### Next.js Type Errors

If you encounter type errors during build:

1. Our current configuration has `typescript.ignoreBuildErrors: true` to bypass these issues
2. For a more permanent solution, ensure your route handler types match Next.js expectations

## Additional Notes

- The application is configured with `output: 'standalone'` in next.config.ts which is great for self-hosting but not necessary for Vercel
- Middleware is in place to protect dashboard and API routes, requiring authentication
- Static assets are served from the public directory

## Performance Monitoring

After deployment, monitor:

1. Server response times in Vercel Analytics
2. Error rates in application logs
3. Database performance in MongoDB Atlas dashboard
4. Redis memory usage (if applicable)

## Scaling Considerations

- Vercel automatically scales your application as needed
- For MongoDB, consider upgrading your Atlas tier as your data grows
- For Redis, monitor memory usage and upgrade as necessary
