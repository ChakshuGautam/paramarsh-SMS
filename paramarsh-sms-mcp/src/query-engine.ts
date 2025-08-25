import fetch from 'node-fetch';

export interface QueryOptions {
  query: string;
  module: 'students' | 'teachers' | 'attendance' | 'invoices' | 'communications' | 'general';
  branchId?: string;
  limit?: number;
}

interface APICall {
  endpoint: string;
  params: Record<string, any>;
  description: string;
}

// Configuration
const API_BASE = process.env.PARAMARSH_API_BASE || 'http://localhost:3001/api/admin';
const DEFAULT_BRANCH = process.env.PARAMARSH_DEFAULT_BRANCH || 'dps-main';
const AUTH_TOKEN = process.env.PARAMARSH_AUTH_TOKEN;

/**
 * Main query engine that maps natural language to API calls
 */
export async function queryParamarshSMS(options: QueryOptions): Promise<string> {
  const { query, module, branchId = DEFAULT_BRANCH, limit = 20 } = options;
  
  try {
    const apiCalls = mapQueryToAPICalls(query, module, branchId, limit);
    const results = await Promise.all(
      apiCalls.map(call => executeAPICall(call, branchId))
    );
    
    return formatResults(query, apiCalls, results);
  } catch (error) {
    return `Error processing query: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * Maps natural language queries to specific API endpoints and parameters
 */
function mapQueryToAPICalls(query: string, module: string, branchId: string, limit: number): APICall[] {
  const q = query.toLowerCase();
  
  switch (module) {
    case 'students':
      return mapStudentQueries(q, limit);
    case 'teachers':
      return mapTeacherQueries(q, limit);
    case 'attendance':
      return mapAttendanceQueries(q, limit);
    case 'invoices':
      return mapInvoiceQueries(q, limit);
    case 'communications':
      return mapCommunicationQueries(q, limit);
    case 'general':
      return mapGeneralQueries(q, limit);
    default:
      throw new Error(`Unknown module: ${module}`);
  }
}

/**
 * Student query mappings
 */
function mapStudentQueries(query: string, limit: number): APICall[] {
  const calls: APICall[] = [];
  
  // Class-specific queries
  if (query.includes('class') || query.includes('grade')) {
    const classMatch = query.match(/class\s+(\w+)/i) || query.match(/grade\s+(\w+)/i);
    if (classMatch) {
      calls.push({
        endpoint: '/students',
        params: { 
          page: 1, 
          perPage: limit,
          filter: JSON.stringify({ classId: classMatch[1] })
        },
        description: `Students in ${classMatch[1]}`
      });
    }
  }
  
  // Status-based queries
  if (query.includes('inactive') || query.includes('suspended')) {
    calls.push({
      endpoint: '/students',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ status: 'inactive' })
      },
      description: 'Inactive students'
    });
  } else if (query.includes('active')) {
    calls.push({
      endpoint: '/students',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ status: 'active' })
      },
      description: 'Active students'
    });
  }
  
  // Name-based search
  if (query.includes('named') || query.includes('called')) {
    const nameMatch = query.match(/(?:named|called)\s+(\w+)/i);
    if (nameMatch) {
      calls.push({
        endpoint: '/students',
        params: { 
          page: 1, 
          perPage: limit,
          search: nameMatch[1]
        },
        description: `Students named ${nameMatch[1]}`
      });
    }
  }
  
  // Default: recent students
  if (calls.length === 0) {
    calls.push({
      endpoint: '/students',
      params: { 
        page: 1, 
        perPage: limit,
        sort: '-createdAt'
      },
      description: 'Recent students'
    });
  }
  
  return calls;
}

/**
 * Teacher query mappings
 */
function mapTeacherQueries(query: string, limit: number): APICall[] {
  const calls: APICall[] = [];
  
  // Subject-specific queries
  if (query.includes('math') || query.includes('mathematics')) {
    calls.push({
      endpoint: '/teachers',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ subject: 'mathematics' })
      },
      description: 'Mathematics teachers'
    });
  }
  
  if (query.includes('science')) {
    calls.push({
      endpoint: '/teachers',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ department: 'science' })
      },
      description: 'Science teachers'
    });
  }
  
  // Status-based queries
  if (query.includes('active')) {
    calls.push({
      endpoint: '/teachers',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ status: 'active' })
      },
      description: 'Active teachers'
    });
  }
  
  // Default: all teachers
  if (calls.length === 0) {
    calls.push({
      endpoint: '/teachers',
      params: { 
        page: 1, 
        perPage: limit,
        sort: 'lastName'
      },
      description: 'All teachers'
    });
  }
  
  return calls;
}

/**
 * Attendance query mappings
 */
function mapAttendanceQueries(query: string, limit: number): APICall[] {
  const calls: APICall[] = [];
  
  // Date-specific queries
  if (query.includes('today')) {
    const today = new Date().toISOString().split('T')[0];
    calls.push({
      endpoint: '/attendance',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ date: today })
      },
      description: 'Today\'s attendance'
    });
  }
  
  if (query.includes('yesterday')) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    calls.push({
      endpoint: '/attendance',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ date: yesterday })
      },
      description: 'Yesterday\'s attendance'
    });
  }
  
  // Status-specific queries
  if (query.includes('absent')) {
    calls.push({
      endpoint: '/attendance',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ status: 'absent' })
      },
      description: 'Absent students'
    });
  }
  
  if (query.includes('present')) {
    calls.push({
      endpoint: '/attendance',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ status: 'present' })
      },
      description: 'Present students'
    });
  }
  
  // Default: recent attendance
  if (calls.length === 0) {
    calls.push({
      endpoint: '/attendance',
      params: { 
        page: 1, 
        perPage: limit,
        sort: '-date'
      },
      description: 'Recent attendance records'
    });
  }
  
  return calls;
}

/**
 * Invoice query mappings  
 */
function mapInvoiceQueries(query: string, limit: number): APICall[] {
  const calls: APICall[] = [];
  
  // Status-based queries
  if (query.includes('overdue') || query.includes('outstanding')) {
    calls.push({
      endpoint: '/invoices',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ status: 'overdue' })
      },
      description: 'Overdue invoices'
    });
  }
  
  if (query.includes('paid')) {
    calls.push({
      endpoint: '/invoices',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ status: 'paid' })
      },
      description: 'Paid invoices'
    });
  }
  
  // Amount-based queries
  const amountMatch = query.match(/(?:over|above|greater than)\s*₹?(\d+)/i);
  if (amountMatch) {
    calls.push({
      endpoint: '/invoices',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ totalAmount_gte: parseInt(amountMatch[1]) })
      },
      description: `Invoices over ₹${amountMatch[1]}`
    });
  }
  
  // Time-based queries
  if (query.includes('this month')) {
    const thisMonth = new Date().toISOString().substring(0, 7);
    calls.push({
      endpoint: '/invoices',
      params: { 
        page: 1, 
        perPage: limit,
        filter: JSON.stringify({ issueDate_contains: thisMonth })
      },
      description: 'This month\'s invoices'
    });
  }
  
  // Payment queries
  if (query.includes('payment')) {
    calls.push({
      endpoint: '/payments',
      params: { 
        page: 1, 
        perPage: limit,
        sort: '-paymentDate'
      },
      description: 'Recent payments'
    });
  }
  
  // Default: recent invoices
  if (calls.length === 0) {
    calls.push({
      endpoint: '/invoices',
      params: { 
        page: 1, 
        perPage: limit,
        sort: '-issueDate'
      },
      description: 'Recent invoices'
    });
  }
  
  return calls;
}

/**
 * Communication query mappings
 */
function mapCommunicationQueries(query: string, limit: number): APICall[] {
  const calls: APICall[] = [];
  
  // Message queries
  if (query.includes('message') || query.includes('sms') || query.includes('email')) {
    if (query.includes('sent') || query.includes('delivered')) {
      calls.push({
        endpoint: '/comms/messages',
        params: { 
          page: 1, 
          perPage: limit,
          filter: JSON.stringify({ status: 'delivered' })
        },
        description: 'Delivered messages'
      });
    } else if (query.includes('failed')) {
      calls.push({
        endpoint: '/comms/messages',
        params: { 
          page: 1, 
          perPage: limit,
          filter: JSON.stringify({ status: 'failed' })
        },
        description: 'Failed messages'
      });
    } else {
      calls.push({
        endpoint: '/comms/messages',
        params: { 
          page: 1, 
          perPage: limit,
          sort: '-createdAt'
        },
        description: 'Recent messages'
      });
    }
  }
  
  // Campaign queries
  if (query.includes('campaign')) {
    if (query.includes('active')) {
      calls.push({
        endpoint: '/campaigns',
        params: { 
          page: 1, 
          perPage: limit,
          filter: JSON.stringify({ status: 'active' })
        },
        description: 'Active campaigns'
      });
    } else {
      calls.push({
        endpoint: '/campaigns',
        params: { 
          page: 1, 
          perPage: limit,
          sort: '-createdAt'
        },
        description: 'Recent campaigns'
      });
    }
  }
  
  // Ticket queries
  if (query.includes('ticket') || query.includes('support')) {
    if (query.includes('open')) {
      calls.push({
        endpoint: '/tickets',
        params: { 
          page: 1, 
          perPage: limit,
          filter: JSON.stringify({ status: 'open' })
        },
        description: 'Open tickets'
      });
    } else if (query.includes('overdue')) {
      calls.push({
        endpoint: '/tickets/overdue',
        params: { 
          page: 1, 
          perPage: limit
        },
        description: 'Overdue tickets'
      });
    } else {
      calls.push({
        endpoint: '/tickets',
        params: { 
          page: 1, 
          perPage: limit,
          sort: '-createdAt'
        },
        description: 'Recent tickets'
      });
    }
  }
  
  // Default: recent messages
  if (calls.length === 0) {
    calls.push({
      endpoint: '/comms/messages',
      params: { 
        page: 1, 
        perPage: limit,
        sort: '-createdAt'
      },
      description: 'Recent messages'
    });
  }
  
  return calls;
}

/**
 * General/stats query mappings
 */
function mapGeneralQueries(query: string, limit: number): APICall[] {
  const calls: APICall[] = [];
  
  if (query.includes('overview') || query.includes('stats') || query.includes('dashboard')) {
    // Get counts from multiple modules
    calls.push(
      {
        endpoint: '/students',
        params: { page: 1, perPage: 1 },
        description: 'Student count'
      },
      {
        endpoint: '/teachers',  
        params: { page: 1, perPage: 1 },
        description: 'Teacher count'
      },
      {
        endpoint: '/invoices',
        params: { page: 1, perPage: 1, filter: JSON.stringify({ status: 'overdue' }) },
        description: 'Overdue invoice count'
      },
      {
        endpoint: '/tickets',
        params: { page: 1, perPage: 1, filter: JSON.stringify({ status: 'open' }) },
        description: 'Open ticket count'
      }
    );
  }
  
  return calls;
}

/**
 * Execute API call with authentication and branch context
 */
async function executeAPICall(apiCall: APICall, branchId: string): Promise<any> {
  const url = new URL(`${API_BASE}${apiCall.endpoint}`);
  
  // Add query parameters
  Object.entries(apiCall.params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Branch-Id': branchId,
    'X-School-Id': 'dps', // Default school
  };
  
  if (AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as any;
  return { ...data, _description: apiCall.description };
}

/**
 * Format results into readable text
 */
function formatResults(query: string, apiCalls: APICall[], results: any[]): string {
  let output = `# Query: "${query}"\n\n`;
  
  results.forEach((result, index) => {
    const description = result._description || `Result ${index + 1}`;
    output += `## ${description}\n\n`;
    
    if (result.data && Array.isArray(result.data)) {
      if (result.data.length === 0) {
        output += 'No records found.\n\n';
      } else {
        output += `Found ${result.data.length} records (Total: ${result.total || result.data.length})\n\n`;
        
        // Format first few records
        const displayCount = Math.min(5, result.data.length);
        result.data.slice(0, displayCount).forEach((record: any, i: number) => {
          output += formatRecord(record, i + 1);
        });
        
        if (result.data.length > displayCount) {
          output += `... and ${result.data.length - displayCount} more records\n\n`;
        }
      }
    } else if (result.total !== undefined) {
      output += `Total count: ${result.total}\n\n`;
    } else {
      output += `${JSON.stringify(result, null, 2)}\n\n`;
    }
  });
  
  return output;
}

/**
 * Format individual record for display
 */
function formatRecord(record: any, index: number): string {
  let output = `**${index}. `;
  
  // Determine record type and format accordingly
  if (record.firstName && record.lastName) {
    // Student/Teacher record
    output += `${record.firstName} ${record.lastName}**\n`;
    if (record.email) output += `   Email: ${record.email}\n`;
    if (record.phone) output += `   Phone: ${record.phone}\n`;
    if (record.status) output += `   Status: ${record.status}\n`;
  } else if (record.subject || record.description) {
    // Ticket/Message record
    output += `${record.subject || record.description}**\n`;
    if (record.status) output += `   Status: ${record.status}\n`;
    if (record.priority) output += `   Priority: ${record.priority}\n`;
    if (record.channel) output += `   Channel: ${record.channel}\n`;
  } else if (record.totalAmount !== undefined) {
    // Invoice record
    output += `Invoice ₹${record.totalAmount}**\n`;
    if (record.status) output += `   Status: ${record.status}\n`;
    if (record.dueDate) output += `   Due: ${record.dueDate}\n`;
  } else if (record.name) {
    // Named record (Campaign, Template, etc.)
    output += `${record.name}**\n`;
    if (record.status) output += `   Status: ${record.status}\n`;
  } else {
    // Generic record
    output += `Record**\n`;
    Object.entries(record).slice(0, 3).forEach(([key, value]) => {
      if (key !== 'id' && value) {
        output += `   ${key}: ${value}\n`;
      }
    });
  }
  
  output += '\n';
  return output;
}