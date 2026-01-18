// Debug script to check collection name and data
// Run: node debug-collection.js

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.DBURL || process.env.MONGO_URI || 'mongodb://localhost:27017/auth-app';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    return false;
  }
};

async function debugCollection() {
  const connected = await connectDB();
  if (!connected) return;

  const db = mongoose.connection.db;
  
  // List all collections
  console.log('\n📋 All collections in database:');
  const collections = await db.listCollections().toArray();
  collections.forEach(col => {
    console.log(`  - ${col.name}`);
  });

  // Try to find the accessories collection
  const possibleNames = ['accessories', 'Accesories', 'accesories', 'Accessories'];
  
  for (const name of possibleNames) {
    try {
      const collection = db.collection(name);
      const count = await collection.countDocuments();
      console.log(`\n🔍 Collection "${name}": ${count} documents`);
      
      if (count > 0) {
        const sample = await collection.findOne({});
        console.log(`📦 Sample document:`, {
          _id: sample._id,
          name: sample.name,
          category: sample.category,
          subcategory: sample.subcategory,
          price: sample.price
        });
        
        // Show all unique subcategories
        const subcategories = await collection.distinct('subcategory');
        console.log(`📂 Unique subcategories:`, subcategories);
      }
    } catch (err) {
      console.log(`❌ Collection "${name}" not found or error:`, err.message);
    }
  }

  mongoose.connection.close();
  console.log('\n✅ Debug complete');
}

debugCollection();
