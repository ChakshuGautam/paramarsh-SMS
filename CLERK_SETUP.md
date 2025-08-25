# Clerk Authentication Setup Guide

## ✅ What Has Been Implemented

1. **Frontend Authentication**
   - ClerkProvider integration in root layout
   - Sign-in page with branch selection at `/sign-in`
   - AuthProvider configured for React Admin
   - Branch ID stored in localStorage and sent with API requests

2. **Backend Security**
   - Clerk authentication guard for API protection
   - Role-based access control support
   - Branch-based multi-tenancy maintained

3. **User Management Script**
   - Script to create 4 users with different roles
   - Automated setup for testing

## 📋 Setup Instructions

### Step 1: Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose "Username" as the authentication method

### Step 2: Get Your API Keys

1. In Clerk Dashboard, go to "API Keys"
2. Copy your keys:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

### Step 3: Configure Environment Variables

Update `.env.local` with your actual keys:

```bash
# Replace with your actual Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
```

### Step 4: Create Test Users

Run the setup script to create 4 users with different roles:

```bash
# Install dependencies first
bun install

# Run the user setup script
tsx scripts/setup-clerk-users.ts
```

This will create:
- **Admin User**: username: `admin`, password: `Admin@123`
- **Teacher User**: username: `teacher`, password: `Teacher@123`
- **Student User**: username: `student`, password: `Student@123`
- **Parent User**: username: `parent`, password: `Parent@123`

### Step 5: Configure Clerk Dashboard

In your Clerk Dashboard:

1. **Enable Username Authentication**:
   - Go to "User & Authentication" → "Email, Phone, Username"
   - Enable "Username"
   - Disable email/phone if not needed

2. **Set Redirect URLs**:
   - Go to "Paths"
   - Sign-in URL: `/sign-in`
   - After sign-in URL: `/admin`

3. **Enable Public Metadata** (for roles):
   - Go to "Sessions" → "Customize session token"
   - Add custom claim:
   ```json
   {
     "publicMetadata": "{{user.public_metadata}}"
   }
   ```

## 🚀 Running the Application

1. **Start the backend**:
   ```bash
   cd apps/api
   bun run start:dev
   ```

2. **Start the frontend**:
   ```bash
   cd apps/web
   bun run dev
   ```

3. **Access the application**:
   - Go to [http://localhost:3000/admin](http://localhost:3000/admin)
   - You'll be redirected to the sign-in page
   - Select a branch (Main Campus, North Campus, etc.)
   - Login with one of the test users

## 🔐 How It Works

### Authentication Flow
1. User visits `/admin`
2. Middleware checks for authentication
3. If not authenticated, redirects to `/sign-in`
4. User selects branch and logs in with username/password
5. After successful login, redirected to `/admin`
6. Branch ID is stored in localStorage
7. All API requests include:
   - `Authorization: Bearer <clerk-token>`
   - `X-Branch-Id: <selected-branch>`

### Role-Based Access
- User roles are stored in Clerk's `publicMetadata`
- Available roles: `admin`, `teacher`, `student`, `parent`
- Role information is available in both frontend and backend
- Use roles to control feature access

### Multi-Tenancy
- Branch selection happens at login
- Branch ID is sent with every API request
- Backend filters all data by branch ID
- Users only see data from their selected branch

## 🧪 Testing Different Roles

1. **Admin Role**:
   - Full access to all features
   - Can manage all resources
   - Username: `admin`, Password: `Admin@123`

2. **Teacher Role**:
   - Access to academic features
   - Can manage classes, marks, attendance
   - Username: `teacher`, Password: `Teacher@123`

3. **Student Role**:
   - View-only access to personal data
   - Can see own marks, attendance, schedule
   - Username: `student`, Password: `Student@123`

4. **Parent Role**:
   - View access to children's data
   - Can see fees, marks, communications
   - Username: `parent`, Password: `Parent@123`

## 🔧 Troubleshooting

### "Clerk Secret Key is invalid"
- Make sure you've updated `.env.local` with your actual keys
- Restart the development servers after updating environment variables

### Users not created
- Ensure Clerk is configured correctly
- Check that username authentication is enabled
- Verify your secret key is correct

### Cannot login
- Check Clerk Dashboard for any authentication settings
- Ensure redirect URLs are configured correctly
- Verify the frontend is running on port 3000

### Branch not persisting
- Clear browser localStorage and try again
- Check that cookies are enabled
- Ensure JavaScript is enabled

## 📝 Next Steps

1. **Customize Roles**: Modify the roles in `scripts/setup-clerk-users.ts`
2. **Add More Branches**: Update branch list in `/app/sign-in/[[...sign-in]]/page.tsx`
3. **Implement RBAC**: Use role information to show/hide features
4. **Production Setup**: Use production Clerk keys and secure environment variables