import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedSuperAdmin = async (name, email, password) => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        
        // Check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log(`\x1b[33mUser with email ${email} already exists. Updating to superadmin...\x1b[0m`);
            existing.role = 'superadmin';
            await existing.save();
            console.log(`\x1b[32mSuccess: ${email} is now superadmin.\x1b[0m`);
            return;
        }

        // Create fresh superadmin
        const user = await User.create({
            name,
            email,
            password,
            role: 'superadmin',
            userType: 'institutional',
            uniqueId: 'SA-001'
        });

        console.log(`\x1b[32m✨ Success! Initial Super Admin created:\x1b[0m`);
        console.log(`- Name: ${user.name}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Role: ${user.role}`);
        console.log(`\x1b[36mYou can now log in via the dashboard.\x1b[0m`);

    } catch (error) {
        console.error('\x1b[31mSeeding Error:\x1b[0m', error.message);
    } finally {
        await mongoose.disconnect();
    }
};

const args = process.argv.slice(2);
if (args.length < 3) {
    console.log('\x1b[33mUsage: node scripts/seed_superadmin.js "Full Name" email@example.com password123\x1b[0m');
    process.exit(1);
}

seedSuperAdmin(args[0], args[1], args[2]);
