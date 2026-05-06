# Deployment Instructions for Vercel

## Prerequisites
- Vercel account (create at vercel.com)
- GitHub repository synced
- Supabase credentials

## Environment Variables to Configure in Vercel

Set these in your Vercel project settings under Environment Variables:

1. **CORS_ORIGIN** - Your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. **SUPABASE_URL** - Your Supabase project URL
3. **SUPABASE_ANON_KEY** - Your Supabase anonymous key
4. **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key
5. **SUPABASE_TABLE** - Table name (default: `transactions`)

## Deployment Steps

### Method 1: Deploy from GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `https://github.com/anh2251220140-stack/DevOps_mini_final`
4. Configure project:
   - **Framework**: "Other" (for monorepo)
   - **Build Command**: `cd Frontend && npm install && npm run build`
   - **Output Directory**: `Frontend/dist`
   - **Install Command**: Leave default
5. Add environment variables from the list above
6. Click "Deploy"

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod

# Add environment variables when prompted
```

## Project Structure

- **Frontend** (React + Vite): `/`
- **Backend** (Node.js API): `/api/*`

### URL Pattern After Deployment

- Frontend: `https://your-project.vercel.app`
- API Transactions: `https://your-project.vercel.app/api/transactions`
- API Health Check: `https://your-project.vercel.app/health`
- API Tasks: `https://your-project.vercel.app/api/tasks`

## Update Frontend Environment

After deployment, update the production .env.production file:

```bash
VITE_API_URL=https://your-project.vercel.app/api
```

## Monitoring & Logs

- View deployment logs: Dashboard > Project > Deployments
- View function logs: Dashboard > Project > Logs (for serverless functions)

## Notes

- Frontend is served as static files
- Backend runs as Vercel Functions (serverless)
- Each deployment creates a unique URL with git commit SHA
- Production URL is stable and versioned
- Automatic deployments on git push to main branch
