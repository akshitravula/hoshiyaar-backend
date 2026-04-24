import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const findHostDOB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoshiyaar');
        
        const username = 'Host';
        const user = await User.findOne({ username: username });

        if (user) {
            console.log('------------------------------------');
            console.log(`User: ${user.username}`);
            console.log(`Role: ${user.role}`);
            console.log(`Date of Birth (DOB): ${user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : 'Not Set'}`);
            console.log('------------------------------------');
        } else {
            console.log(`User "${username}" not found.`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findHostDOB();
