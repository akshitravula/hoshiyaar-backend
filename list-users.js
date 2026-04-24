import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoshiyaar');
        
        // Find users that contain "host" in any case
        const users = await User.find({ username: { $regex: /host/i } });

        console.log('------------------------------------');
        if (users.length > 0) {
            console.log('Found these similar users:');
            users.forEach(u => {
                console.log(`- Username: "${u.username}", Role: ${u.role || 'student'}`);
            });
        } else {
            console.log('No users containing "host" were found.');
            // List the most recently created users instead to see what we have
            const recent = await User.find().sort({ createdAt: -1 }).limit(5);
            console.log('Here are the 5 most recently created users:');
            recent.forEach(u => {
                console.log(`- Username: "${u.username}", Role: ${u.role || 'student'}`);
            });
        }
        console.log('------------------------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listUsers();
