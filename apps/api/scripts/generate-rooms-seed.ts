#!/usr/bin/env bun

/**
 * Comprehensive Room Seed Data Generator for Paramarsh SMS
 * Generates rooms for all 13 composite branches with proper Indian context
 * 
 * CRITICAL REQUIREMENTS:
 * - Composite branch IDs only (dps-main, kvs-central, etc.)
 * - 15-20 rooms per branch (195-260 total)
 * - Diverse room types with proper facilities
 * - Indian school context (building names, capacities, etc.)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Composite Branch IDs (13 total)
const COMPOSITE_BRANCHES = [
  // Delhi Public School (5 branches)
  'dps-main',
  'dps-north', 
  'dps-south',
  'dps-east',
  'dps-west',
  
  // Kendriya Vidyalaya (3 branches)
  'kvs-central',
  'kvs-cantonment',
  'kvs-airport',
  
  // St. Paul's School (3 branches)
  'sps-primary',
  'sps-secondary', 
  'sps-senior',
  
  // Ryan International School (2 branches)
  'ris-main',
  'ris-extension'
];

// Building types for Indian schools
const BUILDINGS = [
  'Main Block',
  'Science Block', 
  'Admin Block',
  'Library Block',
  'Sports Complex',
  'Primary Wing',
  'Secondary Wing'
];

// Room type configurations
const ROOM_TYPES = {
  classroom: {
    percentage: 0.50,
    capacity: { min: 30, max: 40 },
    facilities: ['blackboard', 'projector', 'air_conditioning', 'smart_board', 'ceiling_fan', 'whiteboard'],
    buildings: ['Main Block', 'Primary Wing', 'Secondary Wing']
  },
  laboratory: {
    percentage: 0.20,
    subtypes: ['Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Computer Lab', 'Math Lab', 'Language Lab'],
    capacity: { min: 20, max: 30 },
    facilities: {
      'Physics Lab': ['lab_benches', 'electrical_outlets', 'safety_equipment', 'projector', 'air_conditioning'],
      'Chemistry Lab': ['lab_benches', 'fume_hood', 'safety_equipment', 'chemical_storage', 'emergency_shower'],
      'Biology Lab': ['lab_benches', 'microscopes', 'specimen_storage', 'projector', 'air_conditioning'],
      'Computer Lab': ['computers', 'projector', 'air_conditioning', 'UPS_backup', 'internet_connection'],
      'Math Lab': ['geometric_models', 'calculators', 'projector', 'whiteboard', 'air_conditioning'],
      'Language Lab': ['audio_equipment', 'headphones', 'projector', 'air_conditioning', 'recording_system']
    },
    buildings: ['Science Block', 'Main Block']
  },
  office: {
    percentage: 0.15,
    subtypes: ['Principal Office', 'Vice Principal Office', 'Admin Office', 'Staff Room', 'Counselor Office', 'Accounts Office'],
    capacity: { min: 5, max: 20 },
    facilities: ['desk', 'computer', 'printer', 'air_conditioning', 'filing_cabinet', 'telephone'],
    buildings: ['Admin Block', 'Main Block']
  },
  library: {
    percentage: 0.10,
    subtypes: ['Main Library', 'Reading Room', 'Reference Section', 'Digital Library'],
    capacity: { min: 40, max: 100 },
    facilities: ['bookshelves', 'reading_tables', 'computers', 'air_conditioning', 'CCTV', 'book_scanner'],
    buildings: ['Library Block', 'Main Block']
  },
  auditorium: {
    percentage: 0.05,
    subtypes: ['Main Auditorium', 'Seminar Hall', 'Conference Room', 'AV Room'],
    capacity: { min: 100, max: 500 },
    facilities: ['sound_system', 'projector', 'stage', 'air_conditioning', 'microphones', 'lighting_system'],
    buildings: ['Main Block', 'Admin Block']
  }
};

// Floor options
const FLOORS = ['Ground Floor', 'Floor 1', 'Floor 2', 'Floor 3', 'Basement 1'];

// Generate unique room codes
function generateRoomCode(building: string, floor: string, roomNumber: number): string {
  const buildingCode = {
    'Main Block': 'MB',
    'Science Block': 'SB', 
    'Admin Block': 'AB',
    'Library Block': 'LB',
    'Sports Complex': 'SC',
    'Primary Wing': 'PW',
    'Secondary Wing': 'SW'
  }[building] || 'MB';
  
  const floorCode = {
    'Ground Floor': '0',
    'Floor 1': '1', 
    'Floor 2': '2',
    'Floor 3': '3',
    'Basement 1': 'B1'
  }[floor] || '0';
  
  return `${buildingCode}-${floorCode}${roomNumber.toString().padStart(2, '0')}`;
}

// Generate facilities array as JSON string
function generateFacilities(roomType: string, subtype?: string): string {
  const typeConfig = ROOM_TYPES[roomType as keyof typeof ROOM_TYPES];
  
  if (roomType === 'laboratory' && subtype && typeConfig.facilities[subtype]) {
    return JSON.stringify(typeConfig.facilities[subtype]);
  }
  
  if (Array.isArray(typeConfig.facilities)) {
    // Randomly select 3-5 facilities from available options
    const facilities = typeConfig.facilities as string[];
    const selectedCount = Math.floor(Math.random() * 3) + 3; // 3-5 facilities
    const shuffled = [...facilities].sort(() => 0.5 - Math.random());
    return JSON.stringify(shuffled.slice(0, selectedCount));
  }
  
  return JSON.stringify(typeConfig.facilities || []);
}

// Generate random capacity within type range
function generateCapacity(roomType: string): number {
  const typeConfig = ROOM_TYPES[roomType as keyof typeof ROOM_TYPES];
  const min = typeConfig.capacity.min;
  const max = typeConfig.capacity.max;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate room name based on type and subtype
function generateRoomName(roomType: string, subtype?: string, roomNumber?: number): string {
  if (subtype) {
    return subtype;
  }
  
  const typeNames = {
    classroom: `Classroom ${roomNumber}`,
    laboratory: `Laboratory ${roomNumber}`,
    office: `Office ${roomNumber}`,
    library: `Library Section ${roomNumber}`,
    auditorium: `Hall ${roomNumber}`
  };
  
  return typeNames[roomType as keyof typeof typeNames] || `Room ${roomNumber}`;
}

// Generate rooms for a specific branch
async function generateRoomsForBranch(branchId: string): Promise<any[]> {
  const rooms = [];
  const targetRoomCount = Math.floor(Math.random() * 6) + 15; // 15-20 rooms per branch
  let roomCounter = 1;
  let uniqueCodeSet = new Set();
  
  console.log(`Generating ${targetRoomCount} rooms for branch: ${branchId}`);
  
  // Calculate rooms per type
  const roomCounts = {
    classroom: Math.floor(targetRoomCount * ROOM_TYPES.classroom.percentage),
    laboratory: Math.floor(targetRoomCount * ROOM_TYPES.laboratory.percentage),
    office: Math.floor(targetRoomCount * ROOM_TYPES.office.percentage),
    library: Math.floor(targetRoomCount * ROOM_TYPES.library.percentage),
    auditorium: Math.max(1, Math.floor(targetRoomCount * ROOM_TYPES.auditorium.percentage))
  };
  
  // Add remaining rooms to classrooms if needed
  const totalAssigned = Object.values(roomCounts).reduce((sum, count) => sum + count, 0);
  if (totalAssigned < targetRoomCount) {
    roomCounts.classroom += (targetRoomCount - totalAssigned);
  }
  
  // Generate rooms for each type
  for (const [roomType, count] of Object.entries(roomCounts)) {
    const typeConfig = ROOM_TYPES[roomType as keyof typeof ROOM_TYPES];
    
    for (let i = 0; i < count; i++) {
      // Select random building from allowed buildings for this type
      const allowedBuildings = Array.isArray(typeConfig.buildings) ? typeConfig.buildings : BUILDINGS;
      const building = allowedBuildings[Math.floor(Math.random() * allowedBuildings.length)];
      const floor = FLOORS[Math.floor(Math.random() * FLOORS.length)];
      
      // Generate unique room code
      let roomCode;
      let attempts = 0;
      do {
        roomCode = generateRoomCode(building, floor, roomCounter + attempts);
        attempts++;
      } while (uniqueCodeSet.has(roomCode) && attempts < 100);
      
      uniqueCodeSet.add(roomCode);
      
      // Select subtype if applicable
      let subtype;
      if ('subtypes' in typeConfig && Array.isArray(typeConfig.subtypes)) {
        subtype = typeConfig.subtypes[Math.floor(Math.random() * typeConfig.subtypes.length)];
      }
      
      const room = {
        branchId,
        code: roomCode,
        name: generateRoomName(roomType, subtype, roomCounter),
        building,
        floor,
        capacity: generateCapacity(roomType),
        type: roomType,
        facilities: generateFacilities(roomType, subtype),
        isActive: Math.random() > 0.05 // 95% active rooms
      };
      
      rooms.push(room);
      roomCounter++;
    }
  }
  
  return rooms;
}

// Main seeding function
async function main() {
  try {
    console.log('🏫 Starting comprehensive room seed data generation...');
    console.log(`📊 Target: 15-20 rooms per branch across ${COMPOSITE_BRANCHES.length} branches`);
    
    // Check if rooms already exist
    const existingRooms = await prisma.room.count();
    if (existingRooms > 0) {
      console.log(`⚠️  Found ${existingRooms} existing rooms. Clearing rooms table...`);
      await prisma.room.deleteMany({});
      console.log('✅ Rooms table cleared');
    }
    
    let totalRooms = 0;
    const branchStats: Record<string, number> = {};
    
    // Generate rooms for each composite branch
    for (const branchId of COMPOSITE_BRANCHES) {
      const branchRooms = await generateRoomsForBranch(branchId);
      
      // Insert rooms for this branch
      await prisma.room.createMany({
        data: branchRooms
      });
      
      branchStats[branchId] = branchRooms.length;
      totalRooms += branchRooms.length;
      
      console.log(`✅ Created ${branchRooms.length} rooms for ${branchId}`);
    }
    
    // Validation
    console.log('\n📋 VALIDATION REPORT');
    console.log('='.repeat(50));
    
    const finalCount = await prisma.room.count();
    console.log(`📊 Total Rooms Created: ${finalCount}`);
    console.log(`🎯 Target Range: ${COMPOSITE_BRANCHES.length * 15}-${COMPOSITE_BRANCHES.length * 20} rooms`);
    console.log(`✅ Status: ${finalCount >= COMPOSITE_BRANCHES.length * 15 ? 'TARGET ACHIEVED' : 'BELOW TARGET'}`);
    
    // Branch distribution
    console.log('\n🏫 BRANCH DISTRIBUTION:');
    for (const [branchId, count] of Object.entries(branchStats)) {
      console.log(`   ${branchId}: ${count} rooms`);
    }
    
    // Type distribution validation
    console.log('\n🏛️  ROOM TYPE DISTRIBUTION:');
    const typeStats = await prisma.room.groupBy({
      by: ['type'],
      _count: { id: true }
    });
    
    for (const stat of typeStats) {
      const percentage = ((stat._count.id / finalCount) * 100).toFixed(1);
      console.log(`   ${stat.type}: ${stat._count.id} rooms (${percentage}%)`);
    }
    
    // Unique code validation
    const uniqueCodes = await prisma.room.groupBy({
      by: ['code'],
      _count: { id: true },
      having: {
        id: {
          _count: {
            gt: 1
          }
        }
      }
    });
    
    if (uniqueCodes.length === 0) {
      console.log('✅ All room codes are unique');
    } else {
      console.log(`❌ Found ${uniqueCodes.length} duplicate room codes!`);
    }
    
    // Facilities validation
    const facilitySample = await prisma.room.findMany({
      select: { code: true, facilities: true },
      take: 3
    });
    
    console.log('\n🔧 FACILITIES SAMPLE:');
    for (const room of facilitySample) {
      try {
        const facilities = JSON.parse(room.facilities || '[]');
        console.log(`   ${room.code}: ${facilities.join(', ')}`);
      } catch (error) {
        console.log(`   ${room.code}: ❌ Invalid JSON`);
      }
    }
    
    console.log('\n🎉 Room seed data generation completed successfully!');
    console.log(`📈 Ready for frontend display at http://localhost:3003/admin#/rooms`);
    
  } catch (error) {
    console.error('❌ Error during room seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

export default main;