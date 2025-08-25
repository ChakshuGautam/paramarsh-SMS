#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Comprehensive room data for all 13 branches with Indian school context
const BRANCHES = [
  // Delhi Public School branches
  { id: 'dps-main', name: 'Delhi Public School - Main Campus', type: 'large' },
  { id: 'dps-north', name: 'Delhi Public School - North Campus', type: 'medium' },
  { id: 'dps-south', name: 'Delhi Public School - South Campus', type: 'medium' },
  { id: 'dps-east', name: 'Delhi Public School - East Campus', type: 'small' },
  { id: 'dps-west', name: 'Delhi Public School - West Campus', type: 'medium' },
  
  // Kendriya Vidyalaya branches
  { id: 'kvs-central', name: 'Kendriya Vidyalaya - Central Branch', type: 'large' },
  { id: 'kvs-cantonment', name: 'Kendriya Vidyalaya - Cantonment Branch', type: 'medium' },
  { id: 'kvs-airport', name: 'Kendriya Vidyalaya - Airport Branch', type: 'small' },
  
  // St. Paul's School branches
  { id: 'sps-primary', name: 'St. Paul\'s School - Primary Wing', type: 'medium' },
  { id: 'sps-secondary', name: 'St. Paul\'s School - Secondary Wing', type: 'medium' },
  { id: 'sps-senior', name: 'St. Paul\'s School - Senior Wing', type: 'small' },
  
  // Ryan International School branches
  { id: 'ris-main', name: 'Ryan International School - Main Branch', type: 'large' },
  { id: 'ris-extension', name: 'Ryan International School - Extension Branch', type: 'medium' },
];

// Room type configurations with Indian school context
const ROOM_TYPES = {
  classroom: {
    buildings: ['Main Block', 'Academic Block', 'Teaching Block'],
    capacity: { min: 30, max: 40 },
    facilities: [
      ['blackboard', 'desks', 'chairs', 'ceiling_fan'],
      ['smart_board', 'projector', 'air_conditioning', 'desks', 'chairs'],
      ['whiteboard', 'computer', 'projector', 'speakers'],
      ['blackboard', 'desks', 'chairs', 'wall_clock', 'notice_board']
    ]
  },
  laboratory: {
    buildings: ['Science Block', 'Lab Block', 'Technical Block'],
    capacity: { min: 20, max: 30 },
    labs: [
      { name: 'Physics Lab', facilities: ['lab_benches', 'electrical_equipment', 'safety_gear', 'measuring_instruments'] },
      { name: 'Chemistry Lab', facilities: ['lab_benches', 'fume_hood', 'chemical_storage', 'safety_equipment'] },
      { name: 'Biology Lab', facilities: ['lab_benches', 'microscopes', 'specimens', 'charts'] },
      { name: 'Computer Lab', facilities: ['computers', 'air_conditioning', 'UPS', 'network_equipment'] },
      { name: 'Language Lab', facilities: ['computers', 'headphones', 'audio_system', 'air_conditioning'] }
    ]
  },
  office: {
    buildings: ['Admin Block', 'Main Block'],
    capacity: { min: 5, max: 15 },
    offices: [
      { name: 'Principal Office', facilities: ['executive_desk', 'computer', 'printer', 'air_conditioning', 'intercom'] },
      { name: 'Vice Principal Office', facilities: ['desk', 'computer', 'filing_cabinet', 'air_conditioning'] },
      { name: 'Staff Room', facilities: ['tables', 'chairs', 'computer', 'printer', 'water_cooler'] },
      { name: 'Admin Office', facilities: ['desks', 'computers', 'filing_cabinets', 'printer'] },
      { name: 'Accounts Office', facilities: ['desks', 'computers', 'safe', 'filing_cabinets'] }
    ]
  },
  library: {
    buildings: ['Library Block', 'Main Block', 'Academic Block'],
    capacity: { min: 50, max: 100 },
    facilities: [
      ['bookshelves', 'reading_tables', 'chairs', 'circulation_desk', 'air_conditioning'],
      ['bookshelves', 'computer_terminals', 'reading_tables', 'reference_section'],
      ['periodical_section', 'reading_tables', 'chairs', 'photocopier']
    ]
  },
  auditorium: {
    buildings: ['Main Block', 'Cultural Block', 'Assembly Hall'],
    capacity: { min: 100, max: 500 },
    facilities: [
      ['stage', 'sound_system', 'projector', 'seating', 'air_conditioning'],
      ['stage', 'lighting_system', 'audio_visual', 'green_rooms'],
      ['podium', 'microphone', 'seating', 'stage_lights']
    ]
  },
  sports: {
    buildings: ['Sports Block', 'Gymnasium', 'Ground Floor'],
    capacity: { min: 20, max: 50 },
    facilities: [
      ['sports_equipment', 'changing_rooms', 'first_aid', 'storage'],
      ['gymnasium_equipment', 'mirrors', 'mats', 'safety_equipment'],
      ['indoor_games', 'table_tennis', 'badminton_court']
    ]
  }
};

// Floor configurations for Indian schools
const FLOORS = ['Ground Floor', 'Floor 1', 'Floor 2', 'Floor 3', 'Basement'];

function generateRoomCode(building: string, floor: string, roomNumber: number): string {
  const buildingCode = building.split(' ').map(word => word.charAt(0)).join('');
  const floorCode = floor === 'Ground Floor' ? 'G' : 
                   floor === 'Basement' ? 'B' : 
                   floor.replace('Floor ', '');
  return `${buildingCode}-${floorCode}${roomNumber.toString().padStart(2, '0')}`;
}

function getRandomCapacity(type: string): number {
  const config = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
  if (!config) return 30;
  return Math.floor(Math.random() * (config.capacity.max - config.capacity.min + 1)) + config.capacity.min;
}

function getRandomFacilities(type: string, subtype?: string): string {
  const config = ROOM_TYPES[type as keyof typeof ROOM_TYPES];
  if (!config) return JSON.stringify(['basic_furniture']);
  
  let facilities;
  if (type === 'laboratory' && 'labs' in config) {
    const lab = config.labs.find(l => l.name === subtype) || config.labs[0];
    facilities = lab.facilities;
  } else if (type === 'office' && 'offices' in config) {
    const office = config.offices.find(o => o.name === subtype) || config.offices[0];
    facilities = office.facilities;
  } else if ('facilities' in config && Array.isArray(config.facilities[0])) {
    facilities = config.facilities[Math.floor(Math.random() * config.facilities.length)];
  } else if ('facilities' in config) {
    facilities = config.facilities;
  } else {
    facilities = ['basic_furniture'];
  }
  
  return JSON.stringify(facilities);
}

function generateRoomsForBranch(branchId: string, branchType: string) {
  const rooms: any[] = [];
  
  // Determine room counts based on branch size
  const roomCounts = {
    large: { classroom: 20, laboratory: 6, office: 5, library: 3, auditorium: 2, sports: 2 },
    medium: { classroom: 15, laboratory: 4, office: 4, library: 2, auditorium: 1, sports: 2 },
    small: { classroom: 10, laboratory: 3, office: 3, library: 1, auditorium: 1, sports: 1 }
  };
  
  const counts = roomCounts[branchType as keyof typeof roomCounts] || roomCounts.medium;
  let roomNumber = 1;
  
  // Generate classrooms
  for (let i = 0; i < counts.classroom; i++) {
    const building = ROOM_TYPES.classroom.buildings[Math.floor(Math.random() * ROOM_TYPES.classroom.buildings.length)];
    const floor = FLOORS[Math.floor(Math.random() * (FLOORS.length - 1))]; // Exclude basement for classrooms
    const code = generateRoomCode(building, floor, roomNumber);
    
    rooms.push({
      id: randomUUID(),
      branchId,
      code,
      name: `Classroom ${roomNumber}`,
      building,
      floor,
      capacity: getRandomCapacity('classroom'),
      type: 'classroom',
      facilities: getRandomFacilities('classroom'),
      isActive: true
    });
    roomNumber++;
  }
  
  // Generate laboratories
  const labTypes = ROOM_TYPES.laboratory.labs;
  for (let i = 0; i < counts.laboratory; i++) {
    const labType = labTypes[i % labTypes.length];
    const building = ROOM_TYPES.laboratory.buildings[Math.floor(Math.random() * ROOM_TYPES.laboratory.buildings.length)];
    const floor = FLOORS[Math.floor(Math.random() * (FLOORS.length - 1))];
    const code = generateRoomCode(building, floor, roomNumber);
    
    rooms.push({
      id: randomUUID(),
      branchId,
      code,
      name: labType.name,
      building,
      floor,
      capacity: getRandomCapacity('laboratory'),
      type: 'laboratory',
      facilities: getRandomFacilities('laboratory', labType.name),
      isActive: true
    });
    roomNumber++;
  }
  
  // Generate offices
  const officeTypes = ROOM_TYPES.office.offices;
  for (let i = 0; i < counts.office; i++) {
    const officeType = officeTypes[i % officeTypes.length];
    const building = ROOM_TYPES.office.buildings[Math.floor(Math.random() * ROOM_TYPES.office.buildings.length)];
    const floor = i === 0 ? 'Ground Floor' : FLOORS[Math.floor(Math.random() * 3)]; // Principal on ground floor
    const code = generateRoomCode(building, floor, roomNumber);
    
    rooms.push({
      id: randomUUID(),
      branchId,
      code,
      name: officeType.name,
      building,
      floor,
      capacity: getRandomCapacity('office'),
      type: 'office',
      facilities: getRandomFacilities('office', officeType.name),
      isActive: true
    });
    roomNumber++;
  }
  
  // Generate libraries
  for (let i = 0; i < counts.library; i++) {
    const building = ROOM_TYPES.library.buildings[Math.floor(Math.random() * ROOM_TYPES.library.buildings.length)];
    const floor = FLOORS[Math.floor(Math.random() * 3)]; // Libraries on accessible floors
    const code = generateRoomCode(building, floor, roomNumber);
    const name = i === 0 ? 'Main Library' : `Reading Room ${i + 1}`;
    
    rooms.push({
      id: randomUUID(),
      branchId,
      code,
      name,
      building,
      floor,
      capacity: getRandomCapacity('library'),
      type: 'library',
      facilities: getRandomFacilities('library'),
      isActive: true
    });
    roomNumber++;
  }
  
  // Generate auditoriums
  for (let i = 0; i < counts.auditorium; i++) {
    const building = ROOM_TYPES.auditorium.buildings[Math.floor(Math.random() * ROOM_TYPES.auditorium.buildings.length)];
    const floor = i === 0 ? 'Ground Floor' : 'Floor 1'; // Main auditorium on ground floor
    const code = generateRoomCode(building, floor, roomNumber);
    const name = i === 0 ? 'Main Auditorium' : `Seminar Hall ${i + 1}`;
    
    rooms.push({
      id: randomUUID(),
      branchId,
      code,
      name,
      building,
      floor,
      capacity: getRandomCapacity('auditorium'),
      type: 'auditorium',
      facilities: getRandomFacilities('auditorium'),
      isActive: true
    });
    roomNumber++;
  }
  
  // Generate sports rooms
  for (let i = 0; i < counts.sports; i++) {
    const building = ROOM_TYPES.sports.buildings[Math.floor(Math.random() * ROOM_TYPES.sports.buildings.length)];
    const floor = 'Ground Floor'; // Sports facilities typically on ground floor
    const code = generateRoomCode(building, floor, roomNumber);
    const name = i === 0 ? 'Sports Room' : 'Indoor Games Room';
    
    rooms.push({
      id: randomUUID(),
      branchId,
      code,
      name,
      building,
      floor,
      capacity: getRandomCapacity('sports'),
      type: 'sports',
      facilities: getRandomFacilities('sports'),
      isActive: true
    });
    roomNumber++;
  }
  
  return rooms;
}

async function validateDatabase() {
  console.log('🔍 VALIDATING DATABASE CONNECTION...');
  
  try {
    // Check if database is accessible
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check Tenant table for composite branch IDs
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true }
    });
    
    console.log(`✅ Found ${tenants.length} tenants in database`);
    
    const compositeBranches = tenants.filter(t => t.id.includes('-'));
    console.log(`✅ Found ${compositeBranches.length} composite branch IDs`);
    
    if (compositeBranches.length === 0) {
      console.log('⚠️ No composite branch IDs found. Creating basic tenant structure...');
      
      // Create basic tenant records for all branches
      for (const branch of BRANCHES) {
        await prisma.tenant.upsert({
          where: { id: branch.id },
          update: {},
          create: {
            id: branch.id,
            name: branch.name,
            subdomain: branch.id.replace('-', '')
          }
        });
      }
      console.log('✅ Created tenant records for all branches');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database validation failed:', error);
    return false;
  }
}

async function seedRoomData() {
  console.log('🌱 STARTING COMPREHENSIVE ROOM SEEDING...');
  console.log('============================================');
  
  // Validate database first
  const isValid = await validateDatabase();
  if (!isValid) {
    console.error('❌ Database validation failed. Cannot proceed with seeding.');
    return;
  }
  
  let totalRoomsCreated = 0;
  const branchSummary: Record<string, number> = {};
  
  try {
    // Clear existing room data
    console.log('🧹 Clearing existing room data...');
    await prisma.room.deleteMany({});
    console.log('✅ Existing room data cleared');
    
    // Generate rooms for each branch
    for (const branch of BRANCHES) {
      console.log(`\n📍 Processing ${branch.name} (${branch.id})...`);
      
      const rooms = generateRoomsForBranch(branch.id, branch.type);
      
      // Insert rooms in batches
      for (const room of rooms) {
        await prisma.room.create({
          data: room
        });
      }
      
      branchSummary[branch.id] = rooms.length;
      totalRoomsCreated += rooms.length;
      
      console.log(`✅ Created ${rooms.length} rooms for ${branch.name}`);
    }
    
    console.log('\n📊 SEEDING SUMMARY');
    console.log('==================');
    console.log(`Total rooms created: ${totalRoomsCreated}`);
    console.log(`Branches processed: ${BRANCHES.length}`);
    
    // Display branch breakdown
    console.log('\n📋 Branch Breakdown:');
    for (const [branchId, count] of Object.entries(branchSummary)) {
      const branch = BRANCHES.find(b => b.id === branchId);
      console.log(`  ${branchId}: ${count} rooms (${branch?.type} campus)`);
    }
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function validateSeedData() {
  console.log('\n🔍 VALIDATING SEED DATA...');
  console.log('===========================');
  
  try {
    // Check total room count
    const totalRooms = await prisma.room.count();
    console.log(`✅ Total rooms in database: ${totalRooms}`);
    
    // Check rooms per branch
    const roomsByBranch = await prisma.room.groupBy({
      by: ['branchId'],
      _count: { id: true },
      orderBy: { branchId: 'asc' }
    });
    
    console.log('\n📊 Rooms per branch:');
    for (const branch of roomsByBranch) {
      console.log(`  ${branch.branchId}: ${branch._count.id} rooms`);
    }
    
    // Check room type distribution
    const roomsByType = await prisma.room.groupBy({
      by: ['type'],
      _count: { id: true },
      orderBy: { type: 'asc' }
    });
    
    console.log('\n🏗️ Room type distribution:');
    for (const type of roomsByType) {
      console.log(`  ${type.type}: ${type._count.id} rooms`);
    }
    
    // Check unique codes
    const uniqueCodes = await prisma.room.findMany({
      select: { code: true }
    });
    const codeSet = new Set(uniqueCodes.map(r => r.code));
    console.log(`✅ Unique room codes: ${codeSet.size}/${uniqueCodes.length}`);
    
    // Sample room data
    console.log('\n📝 Sample room data:');
    const sampleRooms = await prisma.room.findMany({
      take: 5,
      select: {
        code: true,
        name: true,
        building: true,
        floor: true,
        type: true,
        capacity: true,
        branchId: true,
        facilities: true
      }
    });
    
    for (const room of sampleRooms) {
      console.log(`  ${room.code} | ${room.name} | ${room.building} | ${room.type} | Cap: ${room.capacity} | Branch: ${room.branchId}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('🏫 PARAMARSH SMS - COMPREHENSIVE ROOM SEED DATA GENERATOR');
    console.log('=========================================================');
    console.log(`📅 Started: ${new Date().toISOString()}\n`);
    
    await seedRoomData();
    await validateSeedData();
    
    console.log('\n✅ ROOM SEEDING COMPLETED SUCCESSFULLY!');
    console.log('🎯 Ready for frontend display at http://localhost:3003/admin#/rooms');
    
  } catch (error) {
    console.error('\n❌ SEEDING PROCESS FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if this file is run directly
main().catch(console.error);

export { main as seedRoomData };