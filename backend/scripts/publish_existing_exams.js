import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const publishExistingExams = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('Connected to MongoDB.');
        
        // Find how many draft exams exist
        const draftCount = await Exam.countDocuments({ status: 'draft' });
        console.log(`Found ${draftCount} exams with status "draft".`);
        
        if (draftCount > 0) {
            const result = await Exam.updateMany(
                { status: 'draft' },
                { $set: { status: 'published' } }
            );
            console.log(`\x1b[32m✨ Success! Updated ${result.modifiedCount} exams to "published".\x1b[0m`);
        } else {
            console.log('\x1b[33mNo draft exams found to update.\x1b[0m');
        }

    } catch (error) {
        console.error('\x1b[31mMigration Error:\x1b[0m', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};

publishExistingExams();
