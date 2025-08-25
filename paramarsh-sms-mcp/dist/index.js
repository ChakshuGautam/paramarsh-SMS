#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
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
class ParamarshSMSServer {
    server;
    constructor() {
        this.server = new Server({
            name: "paramarsh-sms",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
    }
    setupToolHandlers() {
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
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
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
    async handleStudentQuery(args) {
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
    async handleTeacherQuery(args) {
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
    async handleAttendanceQuery(args) {
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
    async handleInvoiceQuery(args) {
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
    async handleCommunicationQuery(args) {
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
    async handleGeneralQuery(args) {
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
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Paramarsh SMS MCP server running on stdio");
    }
}
const server = new ParamarshSMSServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map