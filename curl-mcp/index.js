#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

class CurlMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "curl-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "curl",
          description:
            "Execute curl HTTP requests with optional jq processing. Returns JSON output.",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "The URL to make the request to",
              },
              method: {
                type: "string",
                description: "HTTP method (GET, POST, PUT, DELETE, etc.)",
                default: "GET",
              },
              headers: {
                type: "object",
                description: "HTTP headers as key-value pairs",
                additionalProperties: {
                  type: "string",
                },
              },
              data: {
                type: "string",
                description: "Request body data",
              },
              jq_filter: {
                type: "string",
                description: "jq filter to apply to the response (e.g., '.total', '.data[0]')",
              },
              curl_options: {
                type: "array",
                items: {
                  type: "string",
                },
                description: "Additional curl options as array of strings",
              },
            },
            required: ["url"],
          },
        },
        {
          name: "curl_raw",
          description:
            "Execute raw curl command as provided, with optional jq processing",
          inputSchema: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description: "The full curl command to execute",
              },
              jq_filter: {
                type: "string",
                description: "jq filter to apply to the response",
              },
            },
            required: ["command"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === "curl") {
          return await this.handleCurl(args);
        } else if (name === "curl_raw") {
          return await this.handleCurlRaw(args);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async handleCurl(args) {
    const {
      url,
      method = "GET",
      headers = {},
      data,
      jq_filter,
      curl_options = [],
    } = args;

    // Build curl command
    let curlCmd = ["curl", "-s"];
    
    // Add method
    if (method !== "GET") {
      curlCmd.push("-X", method);
    }

    // Add headers
    for (const [key, value] of Object.entries(headers)) {
      curlCmd.push("-H", `"${key}: ${value}"`);
    }

    // Add data
    if (data) {
      curlCmd.push("-d", `'${data}'`);
    }

    // Add additional curl options
    curlCmd.push(...curl_options);

    // Add URL
    curlCmd.push(`"${url}"`);

    let fullCommand = curlCmd.join(" ");

    // Add jq filter if provided
    if (jq_filter) {
      fullCommand += ` | jq '${jq_filter}'`;
    }

    return await this.executeCurlCommand(fullCommand, jq_filter);
  }

  async handleCurlRaw(args) {
    const { command, jq_filter } = args;
    
    let fullCommand = command;
    
    // Add jq filter if provided and not already in command
    if (jq_filter && !command.includes("| jq")) {
      fullCommand += ` | jq '${jq_filter}'`;
    }

    return await this.executeCurlCommand(fullCommand, jq_filter);
  }

  async executeCurlCommand(command, jq_filter) {
    try {
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stderr.includes("% Total") && !stderr.includes("Dload")) {
        console.error("Curl stderr:", stderr);
      }

      let result;
      try {
        // Try to parse as JSON if no jq filter was applied
        if (!jq_filter) {
          result = JSON.parse(stdout);
        } else {
          // If jq was used, the output should already be formatted
          result = stdout.trim();
          // Try to parse as JSON if possible
          try {
            result = JSON.parse(result);
          } catch {
            // If not JSON, keep as string
          }
        }
      } catch (parseError) {
        // If parsing fails, return raw output
        result = stdout.trim();
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Curl command failed: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Curl MCP server running on stdio");
  }
}

const server = new CurlMCPServer();
server.run().catch(console.error);