#!/usr/bin/env tsx

/**
 * Script to create Clerk users for the 4 roles in Paramarsh SMS
 * 
 * Before running:
 * 1. Sign up for Clerk at https://clerk.com
 * 2. Create a new application
 * 3. Get your SECRET KEY from the Clerk Dashboard
 * 4. Update the .env.local file with your actual Clerk keys:
 *    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
 *    - CLERK_SECRET_KEY=sk_test_YOUR_KEY
 * 5. Run this script: tsx scripts/setup-clerk-users.ts
 */

import { Clerk } from '@clerk/backend';

// Get the secret key from environment or command line
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || process.argv[2];

if (!CLERK_SECRET_KEY || CLERK_SECRET_KEY === 'sk_test_YOUR_SECRET_KEY') {
  console.error(`
❌ Clerk Secret Key not found or not configured!

Please follow these steps:
1. Sign up for Clerk at https://clerk.com
2. Create a new application
3. Get your SECRET KEY from the Clerk Dashboard
4. Either:
   a) Update .env.local with CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY
   b) Run: tsx scripts/setup-clerk-users.ts sk_test_YOUR_ACTUAL_KEY
`);
  process.exit(1);
}

const clerk = new Clerk({ secretKey: CLERK_SECRET_KEY });

const users = [
  {
    username: 'admin',
    password: 'Admin@123',
    emailAddress: ['admin@paramarsh.edu'],
    firstName: 'Admin',
    lastName: 'User',
    publicMetadata: { role: 'admin' }
  },
  {
    username: 'teacher',
    password: 'Teacher@123',
    emailAddress: ['teacher@paramarsh.edu'],
    firstName: 'Teacher',
    lastName: 'User',
    publicMetadata: { role: 'teacher' }
  },
  {
    username: 'student',
    password: 'Student@123',
    emailAddress: ['student@paramarsh.edu'],
    firstName: 'Student',
    lastName: 'User',
    publicMetadata: { role: 'student' }
  },
  {
    username: 'parent',
    password: 'Parent@123',
    emailAddress: ['parent@paramarsh.edu'],
    firstName: 'Parent',
    lastName: 'User',
    publicMetadata: { role: 'parent' }
  }
];

async function createUsers() {
  console.log('🚀 Creating Clerk users for Paramarsh SMS...\n');

  for (const userData of users) {
    try {
      const user = await clerk.users.createUser({
        username: userData.username,
        password: userData.password,
        emailAddresses: userData.emailAddress,
        firstName: userData.firstName,
        lastName: userData.lastName,
        publicMetadata: userData.publicMetadata,
        skipPasswordChecks: true,
        skipPasswordRequirement: false
      });

      console.log(`✅ Created user: ${userData.username}`);
      console.log(`   Username: ${userData.username}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Role: ${userData.publicMetadata.role}`);
      console.log(`   User ID: ${user.id}\n`);
    } catch (error: any) {
      if (error.errors?.[0]?.code === 'form_identifier_exists') {
        console.log(`⚠️  User ${userData.username} already exists\n`);
      } else {
        console.error(`❌ Failed to create user ${userData.username}:`, error.errors || error);
      }
    }
  }

  console.log(`
✨ Setup complete! 

You can now login with:
- Username: admin, Password: Admin@123 (Admin role)
- Username: teacher, Password: Teacher@123 (Teacher role)  
- Username: student, Password: Student@123 (Student role)
- Username: parent, Password: Parent@123 (Parent role)

Remember to select your branch when logging in!
`);
}

createUsers().catch(console.error);