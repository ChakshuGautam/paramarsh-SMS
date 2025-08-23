#!/usr/bin/env node

/**
 * Test script for MCP server commands
 * This tests the actual MCP server by invoking its commands programmatically
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPTester {
  constructor() {
    this.mcpProcess = null;
    this.testResults = [];
  }

  // Start the MCP server
  async startMCPServer() {
    console.log('🚀 Starting MCP server...');
    
    return new Promise((resolve, reject) => {
      this.mcpProcess = spawn('node', [path.join(__dirname, 'dist/index.js')], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.mcpProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        if (msg.includes('MCP server running')) {
          console.log('✅ MCP server started');
          resolve();
        }
      });

      this.mcpProcess.on('error', (err) => {
        console.error('❌ Failed to start MCP server:', err);
        reject(err);
      });

      setTimeout(() => resolve(), 2000); // Fallback timeout
    });
  }

  // Send a command to the MCP server
  async sendCommand(toolName, args = {}) {
    console.log(`\n📤 Testing command: ${toolName}`);
    
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    return new Promise((resolve) => {
      // Write request to stdin
      this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');

      // Listen for response
      const responseHandler = (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === request.id) {
            this.mcpProcess.stdout.removeListener('data', responseHandler);
            resolve(response);
          }
        } catch (e) {
          // Not JSON, might be partial data
        }
      };

      this.mcpProcess.stdout.on('data', responseHandler);

      // Timeout after 5 seconds
      setTimeout(() => {
        this.mcpProcess.stdout.removeListener('data', responseHandler);
        resolve({ error: 'Timeout' });
      }, 5000);
    });
  }

  // Test configuration command
  async testConfiguration() {
    console.log('\n🔧 Testing Configuration...');
    
    // Test with localhost configuration
    const result = await this.sendCommand('configure', {
      host: 'localhost',
      username: process.env.USER,
      projectPath: '/tmp/test-paramarsh',
      apiPort: 10011,
      webPort: 10010,
      password: 'test' // This will fail but tests the command
    });

    this.logResult('Configure', result);
    return result;
  }

  // Test health check command
  async testHealthCheck() {
    console.log('\n🏥 Testing Health Check...');
    
    const result = await this.sendCommand('health-check');
    this.logResult('Health Check', result);
    
    // Parse the health check results
    if (result.result && result.result.content) {
      const content = result.result.content[0].text;
      console.log('\nHealth Check Details:');
      console.log(content);
      
      // Check if it attempted to reach the URLs
      if (content.includes('paramarsh-sms.theflywheel.in')) {
        console.log('✅ Attempted to check frontend URL');
      }
      if (content.includes('api.paramarsh-sms.theflywheel.in')) {
        console.log('✅ Attempted to check API URL');
      }
    }
    
    return result;
  }

  // Test port checking
  async testPortCheck() {
    console.log('\n🔌 Testing Port Check...');
    
    const result = await this.sendCommand('check-ports');
    this.logResult('Check Ports', result);
    return result;
  }

  // Test git status
  async testGitStatus() {
    console.log('\n📊 Testing Git Status...');
    
    const result = await this.sendCommand('git-status');
    this.logResult('Git Status', result);
    return result;
  }

  // Log results
  logResult(command, result) {
    if (result.error) {
      console.log(`❌ ${command}: Error - ${result.error.message || result.error}`);
      this.testResults.push({ command, status: 'error', error: result.error });
    } else if (result.result) {
      console.log(`✅ ${command}: Success`);
      this.testResults.push({ command, status: 'success' });
    } else {
      console.log(`⚠️ ${command}: Unknown response`);
      this.testResults.push({ command, status: 'unknown' });
    }
  }

  // Stop the MCP server
  async stopMCPServer() {
    if (this.mcpProcess) {
      console.log('\n🛑 Stopping MCP server...');
      this.mcpProcess.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ MCP server stopped');
    }
  }

  // Print summary
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    
    const successful = this.testResults.filter(r => r.status === 'success').length;
    const failed = this.testResults.filter(r => r.status === 'error').length;
    const unknown = this.testResults.filter(r => r.status === 'unknown').length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Unknown: ${unknown}`);
    
    console.log('\nDetailed Results:');
    this.testResults.forEach(result => {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'error' ? '❌' : '⚠️';
      console.log(`  ${icon} ${result.command}: ${result.status}`);
      if (result.error) {
        console.log(`     Error: ${result.error.message || result.error}`);
      }
    });
  }

  // Run all tests
  async runTests() {
    try {
      await this.startMCPServer();
      
      // Run tests
      await this.testConfiguration();
      await this.testHealthCheck();
      await this.testPortCheck();
      await this.testGitStatus();
      
      // Print summary
      this.printSummary();
      
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      await this.stopMCPServer();
    }
  }
}

// Alternative: Test with actual SSH to localhost
async function testWithLocalSSH() {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 TESTING WITH LOCAL SSH SIMULATION');
  console.log('='.repeat(50));
  
  const { NodeSSH } = await import('node-ssh');
  const ssh = new NodeSSH();
  
  try {
    // Try to connect to localhost
    console.log('\n📡 Testing SSH connection to localhost...');
    await ssh.connect({
      host: 'localhost',
      username: process.env.USER,
      password: 'test' // This will likely fail
    });
    console.log('✅ Connected to localhost');
  } catch (error) {
    console.log('❌ SSH connection failed (expected for password auth)');
    console.log('   This is normal - real deployment would use SSH keys');
  }
  
  // Test health check with axios
  const axios = (await import('axios')).default;
  
  console.log('\n🌐 Testing health check endpoints directly...');
  
  // Test API health endpoint
  try {
    console.log('   Checking API endpoint...');
    const response = await axios.get('http://localhost:10011/health', { 
      timeout: 2000 
    });
    console.log('   ✅ Local API responded:', response.status);
  } catch (error) {
    console.log('   ❌ Local API not running on port 10011 (expected)');
  }
  
  // Test Web health endpoint  
  try {
    console.log('   Checking Web endpoint...');
    const response = await axios.get('http://localhost:10010', { 
      timeout: 2000 
    });
    console.log('   ✅ Local Web responded:', response.status);
  } catch (error) {
    console.log('   ❌ Local Web not running on port 10010 (expected)');
  }
  
  // Test the actual production URLs
  console.log('\n🌍 Testing production URLs...');
  
  try {
    console.log('   Checking https://api.paramarsh-sms.theflywheel.in ...');
    const response = await axios.get('https://api.paramarsh-sms.theflywheel.in/health', { 
      timeout: 5000 
    });
    console.log('   ✅ Production API is accessible:', response.status);
  } catch (error) {
    console.log('   ❌ Production API not accessible:', error.message);
  }
  
  try {
    console.log('   Checking https://paramarsh-sms.theflywheel.in ...');
    const response = await axios.get('https://paramarsh-sms.theflywheel.in', { 
      timeout: 5000 
    });
    console.log('   ✅ Production Web is accessible:', response.status);
  } catch (error) {
    console.log('   ❌ Production Web not accessible:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 MCP Deployment Server Test Suite');
  console.log('=====================================\n');
  
  // Test MCP commands
  const tester = new MCPTester();
  await tester.runTests();
  
  // Test SSH and health endpoints
  await testWithLocalSSH();
  
  console.log('\n✅ All tests completed!');
}

// Check if MCP server is built
import fs from 'fs';
if (!fs.existsSync(path.join(__dirname, 'dist/index.js'))) {
  console.error('❌ MCP server not built. Run "bun run build" first.');
  process.exit(1);
}

main().catch(console.error);