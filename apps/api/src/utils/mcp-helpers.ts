/**
 * MCP PostgreSQL Server Helper Functions
 * 
 * This module provides utility functions for common database operations
 * using EXCLUSIVELY PostgreSQL MCP Server tools. Never uses psql command-line.
 * 
 * Available MCP Tools:
 * - mcp__MCP_PostgreSQL_Server__db_info
 * - mcp__MCP_PostgreSQL_Server__list_tables
 * - mcp__MCP_PostgreSQL_Server__query
 * - mcp__MCP_PostgreSQL_Server__get_table_schema
 * - mcp__MCP_PostgreSQL_Server__create_record
 * - mcp__MCP_PostgreSQL_Server__read_records
 * - mcp__MCP_PostgreSQL_Server__update_records
 * - mcp__MCP_PostgreSQL_Server__delete_records
 */

// Types for MCP operations
export interface MCPQueryResult {
  rows: any[];
  columns?: string[];
  rowsAffected?: number;
}

export interface MCPTableSchema {
  name: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    foreignKey?: {
      table: string;
      column: string;
    };
  }[];
}

export interface ValidationResult {
  entity?: string;
  field?: string;
  relationship?: string;
  current?: number;
  required?: number;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message?: string;
  details?: any;
}

// MCP function stubs (these would be actual MCP calls in production)
declare const mcp__MCP_PostgreSQL_Server__db_info: () => Promise<any>;
declare const mcp__MCP_PostgreSQL_Server__list_tables: () => Promise<{ tables: string[] }>;
declare const mcp__MCP_PostgreSQL_Server__query: (params: { query: string, values?: any[] }) => Promise<{ rows: any[], columns?: string[], rowCount?: number }>;
declare const mcp__MCP_PostgreSQL_Server__get_table_schema: (params: { table: string }) => Promise<any>;
declare const mcp__MCP_PostgreSQL_Server__create_record: (params: { table: string, data: Record<string, any> }) => Promise<any>;
declare const mcp__MCP_PostgreSQL_Server__read_records: (params: { table: string, conditions?: Record<string, any>, limit?: number, offset?: number }) => Promise<any[]>;
declare const mcp__MCP_PostgreSQL_Server__update_records: (params: { table: string, conditions: Record<string, any>, data: Record<string, any> }) => Promise<{ updatedCount: number }>;
declare const mcp__MCP_PostgreSQL_Server__delete_records: (params: { table: string, conditions: Record<string, any> }) => Promise<{ deletedCount: number }>;

/**
 * Check database connection and status using MCP tools
 */
export async function checkDatabaseStatus(): Promise<any> {
  try {
    return await mcp__MCP_PostgreSQL_Server__db_info();
  } catch (error) {
    throw new Error(`Database status check failed: ${error.message}`);
  }
}

/**
 * Get list of all tables using MCP tools
 */
export async function listAllTables(): Promise<string[]> {
  try {
    const result = await mcp__MCP_PostgreSQL_Server__list_tables();
    return result.tables;
  } catch (error) {
    throw new Error(`Failed to list tables: ${error.message}`);
  }
}

/**
 * Execute a SELECT query using MCP tools
 */
export async function executeQuery(query: string, values?: any[]): Promise<MCPQueryResult> {
  try {
    const result = await mcp__MCP_PostgreSQL_Server__query({ query, values });
    return {
      rows: result.rows,
      columns: result.columns,
      rowsAffected: result.rowCount
    };
  } catch (error) {
    throw new Error(`Query execution failed: ${error.message}`);
  }
}

/**
 * Get detailed table schema using MCP tools
 */
export async function getTableSchema(tableName: string): Promise<MCPTableSchema> {
  try {
    const result = await mcp__MCP_PostgreSQL_Server__get_table_schema({ table: tableName });
    return {
      name: tableName,
      columns: result.columns || []
    };
  } catch (error) {
    throw new Error(`Failed to get schema for ${tableName}: ${error.message}`);
  }
}

/**
 * Create a single record using MCP tools
 */
export async function createRecord(tableName: string, data: Record<string, any>): Promise<any> {
  try {
    // Add required fields if not present
    const recordData = {
      ...data,
      id: data.id || generateUUID(),
      branchId: data.branchId || 'branch1',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };
    
    return await mcp__MCP_PostgreSQL_Server__create_record({ 
      table: tableName, 
      data: recordData 
    });
  } catch (error) {
    throw new Error(`Failed to create record in ${tableName}: ${error.message}`);
  }
}

/**
 * Read records with conditions using MCP tools
 */
export async function readRecords(
  tableName: string, 
  conditions: Record<string, any> = {},
  options: { limit?: number; offset?: number; orderBy?: string } = {}
): Promise<any[]> {
  try {
    return await mcp__MCP_PostgreSQL_Server__read_records({
      table: tableName,
      conditions,
      limit: options.limit,
      offset: options.offset
    });
  } catch (error) {
    throw new Error(`Failed to read records from ${tableName}: ${error.message}`);
  }
}

/**
 * Update records using MCP tools
 */
export async function updateRecords(
  tableName: string, 
  conditions: Record<string, any>, 
  updates: Record<string, any>
): Promise<{ updated: number }> {
  try {
    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const result = await mcp__MCP_PostgreSQL_Server__update_records({
      table: tableName,
      conditions,
      data: updateData
    });
    
    return { updated: result.updatedCount };
  } catch (error) {
    throw new Error(`Failed to update records in ${tableName}: ${error.message}`);
  }
}

/**
 * Delete records using MCP tools
 */
export async function deleteRecords(
  tableName: string, 
  conditions: Record<string, any>
): Promise<{ deleted: number }> {
  try {
    const result = await mcp__MCP_PostgreSQL_Server__delete_records({
      table: tableName,
      conditions
    });
    
    return { deleted: result.deletedCount };
  } catch (error) {
    throw new Error(`Failed to delete records from ${tableName}: ${error.message}`);
  }
}

/**
 * Validate entity count using MCP tools
 */
export async function checkEntityCount(tableName: string, minCount: number): Promise<ValidationResult> {
  try {
    const result = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM ${tableName} 
      WHERE branchId = 'branch1' OR branchId IS NULL
    `);
    
    const currentCount = result.rows[0]?.count || 0;
    const status = currentCount >= minCount ? 'PASS' : 'FAIL';
    
    return {
      entity: tableName,
      current: currentCount,
      required: minCount,
      status,
      message: `${tableName}: ${currentCount}/${minCount} records`
    };
  } catch (error) {
    return {
      entity: tableName,
      status: 'FAIL',
      message: `Count check failed: ${error.message}`
    };
  }
}

/**
 * Validate Indian names using MCP tools
 */
export async function validateIndianNames(tableName: string, nameColumn: string): Promise<ValidationResult> {
  const indianNames = [
    'Aarav', 'Arjun', 'Saanvi', 'Aadhya', 'Sharma', 'Gupta', 'Patel', 
    'Singh', 'Khan', 'Reddy', 'Rao', 'Nair', 'Menon'
  ];
  
  try {
    const result = await executeQuery(`
      SELECT ${nameColumn} 
      FROM ${tableName} 
      WHERE branchId = 'branch1' 
      LIMIT 50
    `);
    
    let indianNameCount = 0;
    for (const row of result.rows) {
      const name = row[nameColumn] || '';
      if (indianNames.some(indianName => name.includes(indianName))) {
        indianNameCount++;
      }
    }
    
    const percentage = result.rows.length > 0 ? (indianNameCount / result.rows.length) * 100 : 0;
    const status = percentage >= 70 ? 'PASS' : percentage >= 40 ? 'WARNING' : 'FAIL';
    
    return {
      entity: tableName,
      field: nameColumn,
      current: Math.round(percentage),
      status,
      message: `${Math.round(percentage)}% Indian names in ${tableName}.${nameColumn}`,
      details: {
        indianNames: indianNameCount,
        totalNames: result.rows.length,
        percentage
      }
    };
  } catch (error) {
    return {
      entity: tableName,
      field: nameColumn,
      status: 'FAIL',
      message: `Indian names validation failed: ${error.message}`
    };
  }
}

/**
 * Validate referential integrity using MCP tools
 */
export async function checkReferentialIntegrity(
  parentTable: string, 
  childTable: string, 
  foreignKey: string,
  parentKey: string = 'id'
): Promise<ValidationResult> {
  try {
    const result = await executeQuery(`
      SELECT COUNT(*) as orphans 
      FROM ${childTable} c 
      LEFT JOIN ${parentTable} p ON c.${foreignKey} = p.${parentKey} 
      WHERE p.${parentKey} IS NULL AND c.${foreignKey} IS NOT NULL
    `);
    
    const orphanCount = result.rows[0]?.orphans || 0;
    const status = orphanCount === 0 ? 'PASS' : 'FAIL';
    
    return {
      relationship: `${childTable}.${foreignKey} → ${parentTable}.${parentKey}`,
      current: orphanCount,
      status,
      message: status === 'PASS' 
        ? 'No orphaned records found' 
        : `${orphanCount} orphaned records found`
    };
  } catch (error) {
    return {
      relationship: `${childTable}.${foreignKey} → ${parentTable}.${parentKey}`,
      status: 'FAIL',
      message: `Referential integrity check failed: ${error.message}`
    };
  }
}

/**
 * Validate multi-tenancy (branchId) using MCP tools
 */
export async function validateMultiTenancy(tableName: string): Promise<ValidationResult> {
  try {
    const result = await executeQuery(`
      SELECT COUNT(*) as missing_branch 
      FROM ${tableName} 
      WHERE branchId IS NULL OR branchId = ''
    `);
    
    const missingBranchId = result.rows[0]?.missing_branch || 0;
    const status = missingBranchId === 0 ? 'PASS' : 'FAIL';
    
    return {
      entity: tableName,
      field: 'branchId',
      current: missingBranchId,
      status,
      message: status === 'PASS' 
        ? 'All records have branchId' 
        : `${missingBranchId} records missing branchId`
    };
  } catch (error) {
    return {
      entity: tableName,
      field: 'branchId',
      status: 'FAIL',
      message: `Multi-tenancy validation failed: ${error.message}`
    };
  }
}

/**
 * Clear all data for a specific branch using MCP tools
 */
export async function clearBranchData(branchId: string = 'branch1'): Promise<void> {
  console.log(`🧹 Clearing all data for branch: ${branchId}`);
  
  // Define table clearing order (respecting foreign key constraints)
  const clearOrder = [
    'StudentPeriodAttendance',
    'AttendanceSession', 
    'TeacherDailyAttendance',
    'TicketMessage', 
    'TicketAttachment', 
    'Ticket',
    'Message', 
    'Campaign', 
    'Template', 
    'Preference',
    'Substitution', 
    'TimetablePeriod', 
    'TimeSlot', 
    'Room',
    'SubjectConstraint', 
    'TeacherConstraint', 
    'RoomConstraint', 
    'TimeSlotConstraint',
    'Mark', 
    'MarksEntry', 
    'ExamSession', 
    'Exam', 
    'GradingScale',
    'Payment', 
    'Invoice', 
    'FeeSchedule', 
    'FeeComponent', 
    'FeeStructure',
    'AttendanceRecord', 
    'Enrollment', 
    'StudentGuardian',
    'Teacher', 
    'Staff', 
    'Student', 
    'Guardian',
    'Section', 
    'Class', 
    'Subject', 
    'AcademicYear',
    'Application'
  ];
  
  let clearedTables = 0;
  let totalRecordsDeleted = 0;
  
  for (const table of clearOrder) {
    try {
      const result = await deleteRecords(table, { branchId });
      totalRecordsDeleted += result.deleted;
      clearedTables++;
      
      console.log(`  ✅ Cleared ${table}: ${result.deleted} records`);
    } catch (error) {
      console.log(`  ⚠️ Could not clear ${table}: ${error.message}`);
    }
  }
  
  console.log(`🎯 Clearing completed: ${clearedTables} tables, ${totalRecordsDeleted} records deleted`);
}

/**
 * Generate random Indian data helpers
 */
export const IndianDataGenerators = {
  firstName: (gender: 'male' | 'female') => {
    const maleNames = [
      'Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Ishaan', 'Pranav', 'Reyansh', 'Krishna', 'Sai',
      'Arnav', 'Ayaan', 'Atharva', 'Aryan', 'Kabir', 'Rohan', 'Rudra', 'Vedant', 'Yash'
    ];
    
    const femaleNames = [
      'Aadhya', 'Saanvi', 'Aarohi', 'Ananya', 'Diya', 'Ishani', 'Kavya', 'Navya', 'Pari',
      'Aanya', 'Aisha', 'Akshara', 'Anvi', 'Avani', 'Bhavya', 'Charvi', 'Darshana', 'Eesha'
    ];
    
    const names = gender === 'male' ? maleNames : femaleNames;
    return names[Math.floor(Math.random() * names.length)];
  },
  
  lastName: () => {
    const lastNames = [
      'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta',
      'Joshi', 'Desai', 'Nair', 'Menon', 'Khan', 'Ahmed', 'Banerjee', 'Mukherjee', 'Das'
    ];
    
    return lastNames[Math.floor(Math.random() * lastNames.length)];
  },
  
  phoneNumber: () => {
    const prefixes = ['9', '8', '7', '6'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = prefix + Math.random().toString().slice(2, 11);
    return `+91-${number}`;
  },
  
  address: () => {
    const areas = [
      'Andheri', 'Bandra', 'Koramangala', 'Indiranagar', 'Banjara Hills', 'Salt Lake',
      'Connaught Place', 'Anna Nagar', 'Alkapuri', 'Civil Lines'
    ];
    
    const cities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'
    ];
    
    const states = [
      'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'West Bengal', 'Telangana'
    ];
    
    const area = areas[Math.floor(Math.random() * areas.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const pincode = 100000 + Math.floor(Math.random() * 899999);
    
    return `${area}, ${city}, ${state} - ${pincode}`;
  },
  
  occupation: () => {
    const occupations = [
      'Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Government Officer',
      'Accountant', 'Lawyer', 'Banker', 'Consultant', 'Manager', 'Sales Executive'
    ];
    
    return occupations[Math.floor(Math.random() * occupations.length)];
  }
};

/**
 * Generate UUID (simplified version)
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate realistic seed data using MCP tools
 */
export class MCPSeedDataGenerator {
  private branchId: string;
  
  constructor(branchId: string = 'branch1') {
    this.branchId = branchId;
  }
  
  /**
   * Generate students with realistic Indian data
   */
  async generateStudents(count: number): Promise<void> {
    console.log(`👥 Generating ${count} students...`);
    
    for (let i = 0; i < count; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = IndianDataGenerators.firstName(gender);
      const lastName = IndianDataGenerators.lastName();
      
      const student = {
        branchId: this.branchId,
        admissionNo: `2024/${String(i + 1).padStart(4, '0')}`,
        firstName,
        lastName,
        dob: this.generateDateOfBirth(),
        gender,
        status: 'active',
        rollNumber: String(i + 1),
        classId: this.getRandomClassId(),
        sectionId: this.getRandomSectionId()
      };
      
      await createRecord('Student', student);
      
      if ((i + 1) % 50 === 0) {
        console.log(`  📝 Generated ${i + 1}/${count} students`);
      }
    }
    
    console.log(`✅ Generated ${count} students successfully`);
  }
  
  /**
   * Generate guardians with relationships
   */
  async generateGuardians(studentsPerGuardian: number = 1.6): Promise<void> {
    console.log(`👨‍👩‍👧‍👦 Generating guardians...`);
    
    const students = await readRecords('Student', { branchId: this.branchId });
    const guardiansToGenerate = Math.ceil(students.length * studentsPerGuardian);
    
    for (let i = 0; i < guardiansToGenerate; i++) {
      const guardianData = {
        branchId: this.branchId,
        name: `${IndianDataGenerators.firstName('male')} ${IndianDataGenerators.lastName()}`,
        email: `guardian${i + 1}@example.com`,
        phoneNumber: IndianDataGenerators.phoneNumber(),
        address: IndianDataGenerators.address(),
        occupation: IndianDataGenerators.occupation()
      };
      
      const guardianResult = await createRecord('Guardian', guardianData);
      
      // Create relationships with students
      const relationshipTypes = ['father', 'mother', 'guardian'];
      const randomStudents = this.getRandomItems(students, Math.random() > 0.7 ? 2 : 1);
      
      for (const student of randomStudents) {
        const relationship = {
          studentId: student.id,
          guardianId: guardianResult.id,
          relation: relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)],
          isPrimary: Math.random() > 0.5,
          canPickup: true,
          emergencyContact: true
        };
        
        await createRecord('StudentGuardian', relationship);
      }
    }
    
    console.log(`✅ Generated ${guardiansToGenerate} guardians with relationships`);
  }
  
  private generateDateOfBirth(): string {
    const currentYear = new Date().getFullYear();
    const age = 5 + Math.floor(Math.random() * 13); // Age 5-18
    const birthYear = currentYear - age;
    const month = 1 + Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 28);
    
    return `${birthYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  private getRandomClassId(): string {
    // Return random class ID - in real implementation, this would query actual classes
    return `class-${Math.floor(Math.random() * 12) + 1}`;
  }
  
  private getRandomSectionId(): string {
    // Return random section ID - in real implementation, this would query actual sections
    const sections = ['A', 'B', 'C', 'D'];
    return `section-${sections[Math.floor(Math.random() * sections.length)]}`;
  }
  
  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

// All functions are already exported above