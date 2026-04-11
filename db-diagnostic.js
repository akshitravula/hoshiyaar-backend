import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDB() {
  console.log('--- MongoDB Diagnostic Start ---');
  console.log('Connecting to:', process.env.MONGO_URI.split('@')[1] || 'URI hidden');
  
  try {
    const start = Date.now();
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    const end = Date.now();
    console.log(`✅ Successfully connected in ${end - start}ms`);

    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.serverStatus();
    console.log(`🔹 Version: ${serverStatus.version}`);
    console.log(`🔹 Uptime: ${serverStatus.uptime} seconds`);
    console.log(`🔹 Current Connections: ${serverStatus.connections.current}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`🔹 Collections found: ${collections.length}`);
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`   - ${col.name}: ${count} documents`);
    }

    console.log('\n--- Status: HEALTHY ---');
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error('Error details:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkDB();
