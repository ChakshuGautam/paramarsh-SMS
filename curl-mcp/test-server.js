#!/usr/bin/env node

// Test script to validate the curl MCP functionality
import { spawn } from 'child_process';

const testMCP = () => {
  console.log('Testing Curl MCP Server...');
  
  const server = spawn('node', ['index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Test the raw curl command example
  const testRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'curl_raw',
      arguments: {
        command: 'curl -X GET "http://localhost:3001/api/admin/invoices?page=1&perPage=1&sort=-id&status=Overdue" -H "x-branch-id: dps-main" -H "Content-Type: application/json"',
        jq_filter: '.total'
      }
    }
  };

  server.stdin.write(JSON.stringify(testRequest) + '\n');

  server.stdout.on('data', (data) => {
    console.log('Response:', data.toString());
  });

  server.stderr.on('data', (data) => {
    console.log('Server log:', data.toString());
  });

  // Clean shutdown after test
  setTimeout(() => {
    server.kill('SIGINT');
    console.log('Test completed');
  }, 5000);
};

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  testMCP();
}