/**
 * RoomSeeder Entity
 * Generates room data for classrooms, labs, and other facilities
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

// Room types configuration
const ROOM_TYPES = {
  classroom: { capacity: { min: 30, max: 50 }, prefix: 'CLASS' },
  laboratory: { capacity: { min: 20, max: 30 }, prefix: 'LAB' },
  computer_lab: { capacity: { min: 25, max: 35 }, prefix: 'COMP' },
  library: { capacity: { min: 50, max: 100 }, prefix: 'LIB' },
  staffroom: { capacity: { min: 10, max: 20 }, prefix: 'STAFF' },
  auditorium: { capacity: { min: 200, max: 500 }, prefix: 'AUD' },
  music_room: { capacity: { min: 20, max: 30 }, prefix: 'MUSIC' },
  art_room: { capacity: { min: 25, max: 35 }, prefix: 'ART' },
  sports_room: { capacity: { min: 30, max: 40 }, prefix: 'SPORT' }
};

// Facilities by room type
const FACILITIES_BY_TYPE = {
  classroom: ['whiteboard', 'projector', 'desks', 'chairs', 'fan', 'lights'],
  laboratory: ['lab_tables', 'sinks', 'gas_outlets', 'safety_equipment', 'storage_cabinets', 'exhaust_fans'],
  computer_lab: ['computers', 'projector', 'ac', 'ups', 'network_points', 'printer'],
  library: ['bookshelves', 'reading_tables', 'chairs', 'computer_terminals', 'ac', 'wifi'],
  staffroom: ['desks', 'chairs', 'lockers', 'water_cooler', 'ac', 'wifi'],
  auditorium: ['stage', 'sound_system', 'lighting', 'ac', 'seating', 'projector'],
  music_room: ['instruments', 'sound_proofing', 'storage', 'chairs', 'music_stands'],
  art_room: ['easels', 'sinks', 'storage_cabinets', 'drying_racks', 'display_boards'],
  sports_room: ['sports_equipment', 'storage_racks', 'mats', 'first_aid', 'water_cooler']
};

// Building configuration
const BUILDINGS = ['Main Building', 'Science Block', 'Admin Block'];
const FLOORS = ['Ground', '1', '2', '3'];

export class RoomSeeder extends BaseSeeder {
  public entityName = 'rooms';
  public dependencies = ['tenants'];
  public priority = 35; // After core entities but before timetable
  
  private roomCounter = 1;

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const rooms: any[] = [];
    const errors: string[] = [];

    try {
      // Check if rooms already exist for this branch
      const existingRooms = await context.prisma.room.findMany({
        where: { branchId: context.branchId }
      });
      
      if (existingRooms.length > 0) {
        // Rooms already exist, return them with zero new records
        context.createdEntities.set('rooms', existingRooms);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            totalRecords: 0,  // No new records created
            successCount: 0,  // No new successes
            errorCount: 0,
            duration: Date.now() - startTime
          }
        };
      }

      // Generate rooms for different purposes
      const roomPlan = this.generateRoomPlan();
      
      for (const [type, count] of Object.entries(roomPlan)) {
        for (let i = 0; i < count; i++) {
          try {
            const room = await this.createRoom(
              context,
              type as keyof typeof ROOM_TYPES,
              i + 1
            );
            rooms.push(room);
          } catch (error) {
            const errorMsg = `Failed to create ${type} room ${i + 1}: ${error}`;
            errors.push(errorMsg);
            // Continue trying to create other rooms even if one fails
          }
        }
      }

      // Store created rooms in context for dependent seeders
      context.createdEntities.set('rooms', rooms);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: rooms.length,
          successCount: rooms.length,
          errorCount: errors.length,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: rooms,
        errors: errors.length > 0 ? errors.map(e => typeof e === "string" ? new Error(e) : e) : [],
        warnings: []
      };

    } catch (error) {
      return {
        success: false,
        entityName: this.entityName,
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        errors: [new Error(`Critical error in RoomSeeder: ${error}`)],
        data: [],
        warnings: []
      };
    }
  }

  private generateRoomPlan(): Record<string, number> {
    // Generate a realistic distribution of rooms
    return {
      classroom: 20,      // 20 regular classrooms
      laboratory: 4,      // 4 science labs
      computer_lab: 2,    // 2 computer labs
      library: 1,         // 1 library
      staffroom: 2,       // 2 staff rooms
      auditorium: 1,      // 1 auditorium
      music_room: 1,      // 1 music room
      art_room: 1,        // 1 art room
      sports_room: 1      // 1 sports/activity room
    };
  }

  private async createRoom(
    context: SeedContext,
    type: keyof typeof ROOM_TYPES,
    index: number
  ): Promise<any> {
    const config = ROOM_TYPES[type];
    const code = this.generateRoomCode(context.branchId, config.prefix, index);
    const capacity = this.getRandomCapacity(config.capacity.min, config.capacity.max);
    const building = this.getRandomBuilding(type);
    const floor = this.getRandomFloor(building, type);
    const facilities = this.getFacilities(type);

    const room = await context.prisma.room.create({
      data: {
        branchId: context.branchId,
        name: this.generateRoomName(type, index),
        code: code,
        type: type,
        capacity: capacity,
        building: building,
        floor: floor,
        facilities: JSON.stringify(facilities),
        isActive: true
      }
    });

    this.roomCounter++;
    return room;
  }

  private generateRoomCode(branchId: string, prefix: string, index: number): string {
    // Format: BRN-TYPE-001
    const branchPrefix = branchId.toUpperCase().slice(0, 3);
    const number = String(index).padStart(3, '0');
    return `${branchPrefix}-${prefix}-${number}`;
  }

  private generateRoomName(type: string, index: number): string {
    const typeNames: Record<string, string> = {
      classroom: `Classroom ${index}`,
      laboratory: `Science Lab ${index}`,
      computer_lab: `Computer Lab ${index}`,
      library: 'Library',
      staffroom: `Staff Room ${index}`,
      auditorium: 'Auditorium',
      music_room: 'Music Room',
      art_room: 'Art Room',
      sports_room: 'Sports Activity Room'
    };
    
    return typeNames[type] || `Room ${this.roomCounter}`;
  }

  private getRandomCapacity(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomBuilding(type: string): string {
    // Assign buildings based on room type
    if (type === 'laboratory' || type === 'computer_lab') {
      return 'Science Block';
    } else if (type === 'staffroom' || type === 'library') {
      return Math.random() > 0.5 ? 'Admin Block' : 'Main Building';
    } else {
      // Classrooms mostly in Main Building
      return Math.random() > 0.2 ? 'Main Building' : BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];
    }
  }

  private getRandomFloor(building: string, type: string): string {
    // Certain rooms typically on ground floor
    if (type === 'auditorium' || type === 'library') {
      return 'Ground';
    }
    
    // Admin block typically has fewer floors
    if (building === 'Admin Block') {
      return FLOORS[Math.floor(Math.random() * 2)]; // Ground or 1st floor only
    }
    
    // Regular distribution for other buildings
    return FLOORS[Math.floor(Math.random() * FLOORS.length)];
  }

  private getFacilities(type: keyof typeof FACILITIES_BY_TYPE): string[] {
    const baseFacilities = FACILITIES_BY_TYPE[type] || ['desks', 'chairs', 'whiteboard'];
    
    // Randomly add some additional common facilities
    const additionalFacilities = ['fire_extinguisher', 'cctv', 'notice_board'];
    const selectedAdditional = additionalFacilities.filter(() => Math.random() > 0.7);
    
    return [...baseFacilities, ...selectedAdditional];
  }
}