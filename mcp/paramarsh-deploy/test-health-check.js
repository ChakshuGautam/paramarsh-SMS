#!/usr/bin/env node

/**
 * Simple test for health check functionality
 */

import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testHealthChecks() {
  console.log('🏥 Testing Health Check Functionality');
  console.log('=' .repeat(50));
  
  // Test 1: Check if local ports are in use
  console.log('\n1️⃣ Checking local ports 10010 and 10011...');
  
  try {
    const { stdout: port10010 } = await execAsync('lsof -i :10010 | grep LISTEN || echo "Port 10010 not in use"');
    const { stdout: port10011 } = await execAsync('lsof -i :10011 | grep LISTEN || echo "Port 10011 not in use"');
    
    console.log('   Port 10010:', port10010.trim());
    console.log('   Port 10011:', port10011.trim());
  } catch (error) {
    console.log('   Could not check ports:', error.message);
  }
  
  // Test 2: Try to reach localhost endpoints
  console.log('\n2️⃣ Testing localhost endpoints...');
  
  const localEndpoints = [
    { url: 'http://localhost:10010', name: 'Local Web (10010)' },
    { url: 'http://localhost:10011/health', name: 'Local API (10011)' },
    { url: 'http://localhost:8080/health', name: 'Local API (8080)' },
    { url: 'http://localhost:3000', name: 'Local Web (3000)' }
  ];
  
  for (const endpoint of localEndpoints) {
    try {
      const start = Date.now();
      const response = await axios.get(endpoint.url, { 
        timeout: 2000,
        validateStatus: () => true // Accept any status
      });
      const time = Date.now() - start;
      
      console.log(`   ✅ ${endpoint.name}: Status ${response.status} (${time}ms)`);
      
      // If it's a health endpoint, show the response
      if (endpoint.url.includes('/health') && response.data) {
        console.log(`      Response:`, JSON.stringify(response.data).substring(0, 100));
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ ${endpoint.name}: Not running`);
      } else {
        console.log(`   ❌ ${endpoint.name}: ${error.message}`);
      }
    }
  }
  
  // Test 3: Check production URLs
  console.log('\n3️⃣ Testing production URLs...');
  
  const prodEndpoints = [
    { url: 'https://paramarsh-sms.theflywheel.in', name: 'Production Web' },
    { url: 'https://api.paramarsh-sms.theflywheel.in/health', name: 'Production API' }
  ];
  
  for (const endpoint of prodEndpoints) {
    try {
      const start = Date.now();
      const response = await axios.get(endpoint.url, { 
        timeout: 10000,
        validateStatus: () => true,
        headers: {
          'User-Agent': 'MCP-Health-Check/1.0'
        }
      });
      const time = Date.now() - start;
      
      console.log(`   ✅ ${endpoint.name}: Status ${response.status} (${time}ms)`);
      console.log(`      URL: ${endpoint.url}`);
      
      // Check for specific headers or content
      if (response.headers['content-type']) {
        console.log(`      Content-Type: ${response.headers['content-type']}`);
      }
      
      if (endpoint.url.includes('/health') && response.data) {
        console.log(`      Response:`, JSON.stringify(response.data).substring(0, 100));
      }
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        console.log(`   ❌ ${endpoint.name}: Domain not found`);
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`   ❌ ${endpoint.name}: Connection timeout`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ ${endpoint.name}: Connection refused`);
      } else {
        console.log(`   ❌ ${endpoint.name}: ${error.message}`);
      }
      console.log(`      URL: ${endpoint.url}`);
    }
  }
  
  // Test 4: Simulate what the MCP health check does
  console.log('\n4️⃣ Simulating MCP health-check command...');
  
  const config = {
    apiUrl: 'https://api.paramarsh-sms.theflywheel.in',
    webUrl: 'https://paramarsh-sms.theflywheel.in'
  };
  
  const results = [];
  
  // Check API
  try {
    const apiStart = Date.now();
    const apiResponse = await axios.get(`${config.apiUrl}/health`, {
      timeout: 10000,
    });
    const apiTime = Date.now() - apiStart;
    
    results.push(`✅ API Health Check:
  Status: ${apiResponse.status}
  Response Time: ${apiTime}ms
  URL: ${config.apiUrl}`);
  } catch (error) {
    results.push(`❌ API Health Check Failed:
  Error: ${error.message}
  URL: ${config.apiUrl}`);
  }
  
  // Check Web
  try {
    const webStart = Date.now();
    const webResponse = await axios.get(config.webUrl, {
      timeout: 10000,
    });
    const webTime = Date.now() - webStart;
    
    results.push(`✅ Web Health Check:
  Status: ${webResponse.status}
  Response Time: ${webTime}ms
  URL: ${config.webUrl}`);
  } catch (error) {
    results.push(`❌ Web Health Check Failed:
  Error: ${error.message}
  URL: ${config.webUrl}`);
  }
  
  console.log(results.join('\n\n'));
  
  // Test 5: Check specific API endpoints
  console.log('\n5️⃣ Testing specific API endpoints...');
  
  const apiEndpoints = [
    '/api/students',
    '/api/teachers',
    '/api/classes',
  ];
  
  for (const endpoint of apiEndpoints) {
    try {
      const response = await axios.get(`${config.apiUrl}${endpoint}`, {
        headers: { 'X-Branch-Id': 'branch1' },
        timeout: 5000,
      });
      console.log(`   ✅ ${endpoint}: Status ${response.status}`);
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.response?.status || error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Health check testing complete!');
}

// Run the tests
testHealthChecks().catch(console.error);