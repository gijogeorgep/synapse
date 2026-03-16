import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetPassword = async (email, newPassword) => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`\x1b[31mError: User with email ${email} not found.\x1b[0m`);
            return;
        }

        // We just assign the plain password; the User model's .pre('save') middleware
        // will automatically hash it before saving.
        user.password = newPassword;
        await user.save();

        console.log(`\x1b[32m✨ Success! Password for ${email} has been reset.\x1b[0m`);
        console.log(`\x1b[36mYou can now log in with your new password.\x1b[0m`);

    } catch (error) {
        console.error('\x1b[31mReset Error:\x1b[0m', error.message);
    } finally {
        await mongoose.disconnect();
    }
};

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('\x1b[33mUsage: node scripts/reset_password.js email@example.com newPassword123\x1b[0m');
    process.exit(1);
}

resetPassword(args[0], args[1]);
