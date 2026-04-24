import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Board from './models/Board.js';

dotenv.config();

const checkBoards = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoshiyaar');
        
        const boards = await Board.find({});
        console.log('------------------------------------');
        console.log(`Found ${boards.length} boards in the database.`);
        if (boards.length > 0) {
            boards.forEach(b => console.log(`- ${b.name}`));
        } else {
            console.log('CRITICAL: Your Boards collection is EMPTY.');
        }
        console.log('------------------------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkBoards();
