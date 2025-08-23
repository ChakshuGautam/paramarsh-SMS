# Paramarsh SMS - Frontend

This is the frontend application for Paramarsh SMS, built with Next.js, React Admin, and shadcn/ui.

## Local Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Start production server locally
bun run start

# Run tests
bun test
```

## Deployment on Vercel

### Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. Backend API deployed on a remote server
3. Clerk authentication credentials

### Environment Variables
Set the following environment variables in your Vercel project:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., https://your-backend.com/api/v1)
- `BACKEND_URL`: Same as NEXT_PUBLIC_API_URL
- `NEXT_PUBLIC_BRANCH_ID`: Default branch ID (usually 'branch1')

### Deployment Steps

#### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# From the apps/web directory
cd apps/web

# Deploy to Vercel
vercel

# Follow the prompts to link/create project
# Set environment variables when prompted
```

#### Option 2: Deploy via GitHub
1. Push your code to GitHub
2. Import project on Vercel dashboard
3. Select the `apps/web` directory as root
4. Configure environment variables
5. Deploy

#### Option 3: Manual Deploy
```bash
# Build locally
cd apps/web
bun install
bun run build

# Deploy the .next folder to Vercel
vercel --prod
```

### Post-Deployment Configuration

1. **Update CORS on Backend**: Ensure your backend allows requests from your Vercel domain:
   - Add `https://your-app.vercel.app` to CORS allowed origins
   
2. **Configure Custom Domain** (optional):
   - Go to Vercel dashboard → Settings → Domains
   - Add your custom domain

3. **Monitor Performance**:
   - Check Vercel Analytics for performance metrics
   - Monitor API response times

### Troubleshooting

#### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend CORS configuration
- Ensure backend is accessible from Vercel servers

#### Build Failures
- Check Node.js version compatibility (18.x or higher)
- Verify all dependencies are installed
- Review build logs in Vercel dashboard

#### Authentication Issues
- Verify Clerk keys are correct
- Check Clerk dashboard for domain configuration
- Ensure production URLs are added to Clerk allowed origins
