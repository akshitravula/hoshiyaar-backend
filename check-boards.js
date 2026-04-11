import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Board from './models/Board.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const boards = await Board.find({});
  console.log('Existing Boards:');
  boards.forEach(b => console.log(`- ${b.name} (${b._id})`));
  await mongoose.disconnect();
}
run().catch(console.error);
