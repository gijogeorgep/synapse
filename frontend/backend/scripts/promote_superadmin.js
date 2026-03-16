import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const promoteToSuperAdmin = async (email) => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOneAndUpdate(
            { email: email.trim() },
            { role: 'superadmin' },
            { new: true }
        );
        if (user) {
            console.log(`\x1b[32mSuccess: ${email} has been promoted to superadmin.\x1b[0m`);
        } else {
            console.log(`\x1b[31mError: User with email ${email} not found.\x1b[0m`);
        }
    } catch (error) {
        console.error('\x1b[31mPromotion Error:\x1b[0m', error.message);
    } finally {
        await mongoose.disconnect();
    }
};

const email = process.argv[2];
if (!email || email === 'synapseeduhub@gmail.com') {
    console.log('\x1b[33mUsage: node scripts/promote_superadmin.js test@example.com\x1b[0m');
    process.exit(1);
}

promoteToSuperAdmin(email);
