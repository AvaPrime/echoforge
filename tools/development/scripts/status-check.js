#!/usr/bin/env node

const http = require('http');

console.log('🔍 EchoForge System Status Check');
console.log('==================================\n');

// Test endpoints
const tests = [
  {
    name: 'Health Check',
    path: '/health',
    port: 8080,
  },
  {
    name: 'API Status',
    path: '/api/status',
    port: 8080,
  },
  {
    name: 'Debug Dashboard',
    path: '/api/debug',
    port: 8080,
  },
  {
    name: 'Codessa Status',
    path: '/api/codessa/status',
    port: 8080,
  },
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: test.port,
      path: test.path,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: parsed,
          });
        } catch (e) {
          resolve({
            success: false,
            error: 'Invalid JSON response',
            data: data,
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
      });
    });

    req.end();
  });
}

async function runTests() {
  for (const test of tests) {
    console.log(`Testing ${test.name}...`);
    const result = await testEndpoint(test);

    if (result.success) {
      console.log(`✅ ${test.name}: Status ${result.status}`);
      if (result.data) {
        console.log(
          `   Response: ${JSON.stringify(result.data, null, 2).split('\n').slice(0, 3).join('\n')}...`
        );
      }
    } else {
      console.log(`❌ ${test.name}: ${result.error}`);
    }
    console.log('');
  }

  // Test Codessa endpoint
  console.log('Testing Codessa Execute endpoint...');
  const codessaTest = await testCodessaEndpoint();
  if (codessaTest.success) {
    console.log(`✅ Codessa Execute: Status ${codessaTest.status}`);
    console.log(`   Task ID: ${codessaTest.data?.result?.task_id}`);
    console.log(`   Status: ${codessaTest.data?.result?.status}`);
  } else {
    console.log(`❌ Codessa Execute: ${codessaTest.error}`);
  }

  console.log('\n🎯 Status Check Complete!');
}

async function testCodessaEndpoint() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      directive: 'test-directive',
      context: { test: true },
      priority: 'low',
    });

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/codessa/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: parsed,
          });
        } catch (e) {
          resolve({
            success: false,
            error: 'Invalid JSON response',
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
      });
    });

    req.write(postData);
    req.end();
  });
}

// Check if server is running first
console.log('Checking if EchoCloud server is running on port 8080...\n');

runTests().catch(console.error);
