import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chapter from './models/Chapter.js';
import Module from './models/Module.js';
import CurriculumItem from './models/CurriculumItem.js';
import Subject from './models/Subject.js';

dotenv.config();

const deleteEmptyModules = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoshiyaar');
        
        // 1. Find the subject and chapter
        const subject = await Subject.findOne({ name: /Science/i });
        if (!subject) {
            console.log('Subject "Science" not found.');
            return;
        }

        const chapter = await Chapter.findOne({ 
            subjectId: subject._id, 
            title: /Measurement and motion/i 
        });

        if (!chapter) {
            console.log('Chapter "Measurement and motion" not found.');
            return;
        }

        console.log(`Checking modules for: ${chapter.title}`);

        // 2. Get all modules in this chapter
        const modules = await Module.find({ chapterId: chapter._id });
        console.log(`Found ${modules.length} modules total.`);

        let deletedCount = 0;

        for (const mod of modules) {
            // 3. Check if module has any items
            const itemCount = await CurriculumItem.countDocuments({ moduleId: mod._id });
            
            if (itemCount === 0) {
                console.log(`Deleting empty module: "${mod.title}" (ID: ${mod._id})`);
                await Module.deleteOne({ _id: mod._id });
                deletedCount++;
            }
        }

        console.log(`------------------------------------`);
        console.log(`Successfully deleted ${deletedCount} empty modules.`);
        console.log(`------------------------------------`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

deleteEmptyModules();
