import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createMaster = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoshiyaar');
        console.log('Connected to MongoDB');

        const username = 'Host';
        
        // Try to find existing
        let user = await User.findOne({ username });

        if (user) {
            user.role = 'master';
            user.onboardingCompleted = false;
            await user.save();
            console.log(`Success! Updated existing user "${username}" to Master role and reset onboarding.`);
        } else {
            // Create new
            user = await User.create({
                username: username,
                name: 'Master User',
                role: 'master',
                dateOfBirth: new Date('2000-01-01'),
                onboardingCompleted: false
            });
            console.log(`Success! Created NEW user "${username}" with Master role.`);
        }

        console.log('User details:', { id: user._id, username: user.username, role: user.role });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createMaster();
