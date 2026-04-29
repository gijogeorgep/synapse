import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import Banner from "./models/Banner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const checkBanners = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const banners = await Banner.find({});
        console.log('Total Banners:', banners.length);
        console.log('Banners Data:', JSON.stringify(banners, null, 2));
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkBanners();
