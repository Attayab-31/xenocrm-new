Xeno CRM Platform
A Mini CRM Platform for customer segmentation, personalized campaign delivery, and intelligent insights, built as part of the Xeno SDE Internship Assignment 2025.
Features

Data Ingestion: REST APIs to ingest customers and orders.
Campaign Creation: Web UI to define audience segments and initiate campaigns.
Campaign Delivery: Simulated vendor API with delivery success/failure logging.
Authentication: Google OAuth 2.0 via NextAuth.
Dashboard: Beautiful dashboard with metrics and recent activity.

Tech Stack

Frontend: Next.js, React, ShadCN, Tailwind CSS
Backend: Next.js API Routes, Mongoose (MongoDB)
Database: MongoDB
Authentication: NextAuth with Google OAuth
Validation: Zod
Optional: Redis Streams for pub-sub (commented out)

Setup Instructions

Clone the repository:git clone <repo-url>
cd xeno-crm


Install dependencies:npm install


Set up environment variables in .env:MONGODB_URI=mongodb://localhost:27017/xeno_crm
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000


Run the development server:npm run dev


Access the app at http://localhost:3000.

Vercel Deployment Instructions

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Configure Environment Variables in Vercel Dashboard:
   - Go to your project settings
   - Add the following environment variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `NEXTAUTH_SECRET`: A secure random string
     - `NEXTAUTH_URL`: Your Vercel deployment URL
     - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
     - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
     - `API_KEY`: Your API key for webhook endpoints
     - `REDIS_URL`: Your Redis connection string (if using Redis)

4. Deploy using the provided script:
```powershell
./deploy.ps1
```

Production Considerations
- Use MongoDB Atlas for the database
- Configure Google OAuth callback URLs
- Set up Redis using Upstash or similar service
- Enable proper CORS settings for your domain
- Configure proper security headers

Architecture Diagram
[Client] --> [Next.js App]
                |
                v
 [API Routes] --> [Mongoose] --> [MongoDB]
                |
                v
 [Vendor API] --> [Delivery Receipt API]

Known Limitations

Simplified rule-based querying in /api/customers/preview.
Pub-sub architecture is commented out (requires Redis setup).
AI features not yet implemented.

Submission

GitHub Repo: <your-repo-url>
Deployed URL: <your-vercel-url>
Demo Video: <your-video-url>

