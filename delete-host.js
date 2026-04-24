import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const deleteHost = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoshiyaar');
        const res = await User.deleteOne({ username: 'Host' });
        console.log(`Deleted ${res.deletedCount} user(s) named "Host".`);
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

deleteHost();
