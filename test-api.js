// Quick test script to verify API endpoints
// Run: node test-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Backend API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', health.data);
    console.log('');

    // Test 2: Get Products (might be empty)
    console.log('2️⃣ Testing Get Products...');
    try {
      const products = await axios.get(`${BASE_URL}/products`);
      console.log('✅ Get Products:', {
        success: products.data.success,
        count: products.data.count || products.data.data?.length || 0
      });
      if (products.data.data && products.data.data.length > 0) {
        console.log('   First product:', products.data.data[0].name);
      } else {
        console.log('   ⚠️  No products found. Run seed endpoint first.');
      }
    } catch (err) {
      console.log('❌ Get Products Failed:', err.message);
      if (err.response) {
        console.log('   Status:', err.response.status);
        console.log('   Response:', err.response.data);
      }
    }
    console.log('');

    // Test 3: Seed Products
    console.log('3️⃣ Testing Seed Products...');
    try {
      const seed = await axios.post(`${BASE_URL}/products/seed`);
      console.log('✅ Seed Products:', seed.data);
    } catch (err) {
      console.log('❌ Seed Products Failed:', err.message);
      if (err.response) {
        console.log('   Status:', err.response.status);
        console.log('   Response:', err.response.data);
      }
    }
    console.log('');

    // Test 4: Get Products Again (should have data now)
    console.log('4️⃣ Testing Get Products After Seed...');
    try {
      const products = await axios.get(`${BASE_URL}/products`);
      console.log('✅ Get Products:', {
        success: products.data.success,
        count: products.data.count || products.data.data?.length || 0
      });
    } catch (err) {
      console.log('❌ Get Products Failed:', err.message);
    }

    console.log('\n✅ All tests completed!');
  } catch (err) {
    console.error('\n❌ Connection Error:', err.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Backend server is running (npm start in server directory)');
    console.error('   2. Server is running on http://localhost:5000');
    console.error('   3. MongoDB is connected');
  }
}

testAPI();
