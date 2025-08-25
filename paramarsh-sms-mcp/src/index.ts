#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { queryParamarshSMS } from "./query-engine.js";

// Tool schemas
const QueryStudentsSchema = z.object({
  query: z.string().describe("Natural language query about students"),
  branchId: z.string().optional().describe("Branch ID to filter by"),
  limit: z.number().optional().default(20).describe("Number of results to return"),
});

const QueryTeachersSchema = z.object({
  query: z.string().describe("Natural language query about teachers"),
  branchId: z.string().optional().describe("Branch ID to filter by"),
  limit: z.number().optional().default(20).describe("Number of results to return"),
});

const QueryAttendanceSchema = z.object({
  query: z.string().describe("Natural language query about attendance"),
  branchId: z.string().optional().describe("Branch ID to filter by"),
  limit: z.number().optional().default(20).describe("Number of results to return"),
});

const QueryInvoicesSchema = z.object({
  query: z.string().describe("Natural language query about invoices/payments"),
  branchId: z.string().optional().describe("Branch ID to filter by"),
  limit: z.number().optional().default(20).describe("Number of results to return"),
});

const QueryCommunicationsSchema = z.object({
  query: z.string().describe("Natural language query about messages, campaigns, or tickets"),
  branchId: z.string().optional().describe("Branch ID to filter by"),
  limit: z.number().optional().default(20).describe("Number of results to return"),
});

const QueryGeneralSchema = z.object({
  query: z.string().describe("General query about school data"),
  branchId: z.string().optional().describe("Branch ID to filter by"),
  limit: z.number().optional().default(20).describe("Number of results to return"),
});

const ServerHealthSchema = z.object({
  checkEndpoints: z.boolean().optional().default(true).describe("Whether to check API endpoint health"),
  verbose: z.boolean().optional().default(false).describe("Whether to return detailed health information"),
});

class ParamarshSMSServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "paramarsh-sms",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "query_students",
            description: "Query student data using natural language (e.g., 'students in class 5A', 'inactive students', 'students enrolled this year')",
            inputSchema: QueryStudentsSchema,
          },
          {
            name: "query_teachers",
            description: "Query teacher data using natural language (e.g., 'math teachers', 'teachers in science department', 'active teachers')",
            inputSchema: QueryTeachersSchema,
          },
          {
            name: "query_attendance", 
            description: "Query attendance data using natural language (e.g., 'attendance today', 'absent students this week', 'attendance for class 5A')",
            inputSchema: QueryAttendanceSchema,
          },
          {
            name: "query_invoices",
            description: "Query invoice and payment data using natural language (e.g., 'overdue invoices', 'payments this month', 'invoices over 5000')",
            inputSchema: QueryInvoicesSchema,
          },
          {
            name: "query_communications",
            description: "Query messages, campaigns, and tickets using natural language (e.g., 'sent messages today', 'active campaigns', 'open tickets')",
            inputSchema: QueryCommunicationsSchema,
          },
          {
            name: "query_general",
            description: "General queries that might span multiple modules or require statistics (e.g., 'school overview', 'monthly stats', 'dashboard data')",
            inputSchema: QueryGeneralSchema,
          },
          {
            name: "server_health",
            description: "Check the health status of the Paramarsh SMS API server and endpoints",
            inputSchema: ServerHealthSchema,
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "query_students":
            return await this.handleStudentQuery(QueryStudentsSchema.parse(args));
          case "query_teachers":
            return await this.handleTeacherQuery(QueryTeachersSchema.parse(args));
          case "query_attendance":
            return await this.handleAttendanceQuery(QueryAttendanceSchema.parse(args));
          case "query_invoices":
            return await this.handleInvoiceQuery(QueryInvoicesSchema.parse(args));
          case "query_communications":
            return await this.handleCommunicationQuery(QueryCommunicationsSchema.parse(args));
          case "query_general":
            return await this.handleGeneralQuery(QueryGeneralSchema.parse(args));
          case "server_health":
            return await this.handleServerHealth(ServerHealthSchema.parse(args));
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async handleStudentQuery(args: z.infer<typeof QueryStudentsSchema>) {
    const result = await queryParamarshSMS({
      query: args.query,
      module: 'students',
      branchId: args.branchId,
      limit: args.limit,
    });
    
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  private async handleTeacherQuery(args: z.infer<typeof QueryTeachersSchema>) {
    const result = await queryParamarshSMS({
      query: args.query,
      module: 'teachers',
      branchId: args.branchId,
      limit: args.limit,
    });
    
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  private async handleAttendanceQuery(args: z.infer<typeof QueryAttendanceSchema>) {
    const result = await queryParamarshSMS({
      query: args.query,
      module: 'attendance',
      branchId: args.branchId,
      limit: args.limit,
    });
    
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  private async handleInvoiceQuery(args: z.infer<typeof QueryInvoicesSchema>) {
    const result = await queryParamarshSMS({
      query: args.query,
      module: 'invoices',
      branchId: args.branchId,
      limit: args.limit,
    });
    
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  private async handleCommunicationQuery(args: z.infer<typeof QueryCommunicationsSchema>) {
    const result = await queryParamarshSMS({
      query: args.query,
      module: 'communications',
      branchId: args.branchId,
      limit: args.limit,
    });
    
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  private async handleGeneralQuery(args: z.infer<typeof QueryGeneralSchema>) {
    const result = await queryParamarshSMS({
      query: args.query,
      module: 'general',
      branchId: args.branchId,
      limit: args.limit,
    });
    
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  private async handleServerHealth(args: z.infer<typeof ServerHealthSchema>) {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8080/api/v1';
    const checkEndpoints = args.checkEndpoints ?? true;
    const verbose = args.verbose ?? false;

    try {
      // Basic health check - check if server is responding
      const startTime = Date.now();
      const healthResponse = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseTime = Date.now() - startTime;

      const isHealthy = healthResponse.ok;
      let result = `🏥 **Paramarsh SMS Server Health Check**\n\n`;
      result += `**Base URL:** ${baseUrl}\n`;
      result += `**Server Status:** ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'} (${healthResponse.status})\n`;

      if (verbose) {
        result += `**Response Time:** ${responseTime}ms\n`;
        result += `**Timestamp:** ${new Date().toISOString()}\n`;
      }

      if (checkEndpoints && isHealthy) {
        result += `\n**📋 Endpoint Health Checks:**\n`;
        
        // Test key endpoints
        const endpoints = [
          { path: '/students', name: 'Students API' },
          { path: '/teachers', name: 'Teachers API' },
          { path: '/invoices', name: 'Invoices API' },
          { path: '/attendance/records', name: 'Attendance API' },
          { path: '/timetable/periods', name: 'Timetable API' },
        ];

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(`${baseUrl}${endpoint.path}?_limit=1`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            const status = response.ok ? '✅' : '❌';
            result += `- ${endpoint.name}: ${status} (${response.status})\n`;
            
            if (verbose && !response.ok) {
              try {
                const errorText = await response.text();
                result += `  Error: ${errorText.substring(0, 100)}...\n`;
              } catch {
                result += `  Error: Failed to read response\n`;
              }
            }
          } catch (error) {
            result += `- ${endpoint.name}: ❌ Connection Error\n`;
            if (verbose) {
              result += `  Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
            }
          }
        }
      }

      if (!isHealthy) {
        try {
          const errorText = await healthResponse.text();
          result += `\n**❌ Health Check Failed:**\n${errorText}\n`;
        } catch {
          result += `\n**❌ Health Check Failed:** Unable to read error response\n`;
        }
      }

      result += `\n**💡 Tips:**\n`;
      result += `- Ensure the API server is running on ${baseUrl}\n`;
      result += `- Check database connectivity if endpoints are failing\n`;
      result += `- Use \`verbose: true\` for detailed error information\n`;

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ **Server Health Check Failed**\n\nUnable to connect to Paramarsh SMS API server at ${baseUrl}\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\n**Troubleshooting:**\n- Verify the server is running\n- Check the API_BASE_URL environment variable\n- Ensure network connectivity`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Paramarsh SMS MCP server running on stdio");
  }
}

const server = new ParamarshSMSServer();
server.run().catch(console.error);