#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');

    // Check if we can connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if basic tables exist by trying to count records
    const tablesToCheck = [
      'tenant',
      'student', 
      'guardian',
      'teacher',
      'room',
      'class',
      'section'
    ];

    for (const table of tablesToCheck) {
      try {
        const result = await (prisma as any)[table].count();
        console.log(`✅ ${table}: ${result} records`);
      } catch (error) {
        console.log(`❌ ${table}: Table does not exist or error - ${(error as Error).message}`);
      }
    }

    // If Room table doesn't exist, let's check what tables do exist
    try {
      const result = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `;
      console.log('\n📋 Tables in database:');
      console.log(result);
    } catch (error) {
      console.log('❌ Could not list tables:', (error as Error).message);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables().catch(console.error);