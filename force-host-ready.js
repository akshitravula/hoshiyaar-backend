import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Board from './models/Board.js';
import Subject from './models/Subject.js';
import ClassLevel from './models/ClassLevel.js';

dotenv.config();

const forceSkipOnboarding = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoshiyaar');
        console.log('Connected to MongoDB');

        // 1. Find valid IDs from your database
        const board = await Board.findOne({ name: 'CBSE' });
        const subject = await Subject.findOne({ name: 'Science' });
        const classLevel = await ClassLevel.findOne({ name: '5' }); // Or whatever grade you have

        if (!board || !subject) {
            console.log('Could not find CBSE or Science in your database. Please select a valid board/subject manually or check your database.');
            process.exit(1);
        }

        // 2. Force the Host user to be fully onboarded with these IDs
        const username = 'Host';
        const user = await User.findOneAndUpdate(
            { username: username },
            { 
                role: 'master',
                onboardingCompleted: true,
                board: board.name,
                subject: subject.name,
                classLevel: classLevel ? classLevel.name : '5',
                boardId: board._id,
                subjectId: subject._id,
                classId: classLevel ? classLevel._id : null
            },
            { new: true }
        );

        if (user) {
            console.log(`Success! "Host" is now a Master and Onboarding is SKIPPED.`);
            console.log(`Curriculum Set: ${user.board} - ${user.subject}`);
        } else {
            console.log(`User "Host" not found.`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

forceSkipOnboarding();
