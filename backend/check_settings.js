import mongoose from "mongoose";
import dotenv from "dotenv";
import GlobalSettings from "./models/GlobalSettings.js";

dotenv.config();

const checkSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const settings = await GlobalSettings.findOne();
        console.log('Global Settings:', JSON.stringify(settings, null, 2));
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkSettings();
