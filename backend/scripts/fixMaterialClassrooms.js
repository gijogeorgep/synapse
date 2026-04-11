/**
 * One-time migration script: Set classroom to null for any StudyMaterial
 * documents where classroom is an empty string (which causes ObjectId cast errors).
 *
 * Run with: node backend/scripts/fixMaterialClassrooms.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import StudyMaterial from "../models/StudyMaterial.js";

dotenv.config({ path: "../.env" });

const fix = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await StudyMaterial.updateMany(
        { classroom: "" },
        { $set: { classroom: null } }
    );

    console.log(`Fixed ${result.modifiedCount} documents with empty-string classroom.`);
    await mongoose.disconnect();
    console.log("Done.");
};

fix().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
