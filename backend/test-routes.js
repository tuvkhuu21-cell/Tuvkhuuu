// Test file to check API routes
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000';

async function testRoute(path, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${path}`, options);
    console.log(`${method} ${path} - Status: ${response.status}`);
    
    if (response.status !== 204) {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    }
    
    console.log('---');
  } catch (error) {
    console.error(`Error testing ${method} ${path}:`, error.message);
  }
}

async function runTests() {
  console.log('Testing API Routes...\n');
  
  // Test health endpoint
  await testRoute('/health');
  
  // Test auth routes
  await testRoute('/api/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'test123'
  });
  
  await testRoute('/api/auth/register', 'POST', {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    role: 'customer'
  });
  
  // Test orders route (will fail without auth, but shows route exists)
  await testRoute('/api/orders');
  
  // Test driver route (will fail without auth, but shows route exists)
  await testRoute('/api/driver/me');
  
  console.log('Route testing complete!');
}

runTests().catch(console.error);
