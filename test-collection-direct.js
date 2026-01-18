// Direct test to check collection and data
// Run: node test-collection-direct.js

const mongoose = require('mongoose');
require('dotenv').config();

async function testDirect() {
  try {
    const mongoURI = process.env.DBURL || process.env.MONGO_URI || 'mongodb://localhost:27017/auth-app';
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // List all collections
    console.log('📋 All collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Try to find products in different collection names
    const possibleNames = ['accessories', 'Accesories', 'accesories', 'Accessories', 'products', 'Products'];
    
    console.log('\n🔍 Checking each collection:');
    for (const name of possibleNames) {
      try {
        const collection = db.collection(name);
        const count = await collection.countDocuments();
        if (count > 0) {
          console.log(`\n✅ Found collection "${name}" with ${count} documents`);
          const sample = await collection.findOne({});
          console.log('📦 Sample document:');
          console.log(JSON.stringify(sample, null, 2));
          
          // Show all unique subcategories
          const subcategories = await collection.distinct('subcategory');
          console.log(`\n📂 Unique subcategories:`, subcategories);
          
          // Show all unique categories
          const categories = await collection.distinct('category');
          console.log(`📂 Unique categories:`, categories);
        } else {
          console.log(`  - "${name}": 0 documents`);
        }
      } catch (err) {
        // Collection doesn't exist
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Test complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDirect();
