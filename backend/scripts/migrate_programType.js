import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Classroom from "../models/Classroom.js"; // Import Classroom model

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const migrateProgramType = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Get all users
    const users = await User.find({}).populate("enrolledClassrooms");
    console.log(`Found ${users.length} users to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      let programType = null;

      // Method 1: Check if user.class matches a program name
      if (user.class) {
        const classUpper = user.class.toUpperCase();

        if (classUpper === "PRIMEONE" || user.class === "PrimeOne") {
          programType = "PrimeOne";
        } else if (classUpper === "CLUSTER" || user.class === "Cluster") {
          programType = "Cluster";
        } else if (classUpper === "PLANB" || user.class === "PlanB") {
          programType = "PlanB";
        } else if (
          classUpper === "DEEP ROOTS" ||
          classUpper === "DEEPROOTS" ||
          user.class === "Deep Roots"
        ) {
          programType = "Deep Roots";
        } else if (classUpper === "NEET") {
          programType = "NEET";
        } else if (classUpper === "JEE") {
          programType = "JEE";
        } else if (classUpper === "PSC") {
          programType = "PSC";
        }
      }

      // Method 2: If no programType yet, try to infer from enrolled classrooms
      if (
        !programType &&
        user.enrolledClassrooms &&
        user.enrolledClassrooms.length > 0
      ) {
        const classroom = user.enrolledClassrooms[0];
        if (classroom.programType) {
          programType = classroom.programType;
        }
      }

      // Update the user if we found a programType
      if (programType) {
        await User.findByIdAndUpdate(user._id, { programType });
        updated++;
        console.log(
          `✓ Updated ${user.name} (${user.email}): programType = ${programType}`,
        );
      } else {
        skipped++;
        console.log(
          `⊘ Skipped ${user.name} (${user.email}): No programType could be determined`,
        );
      }
    }

    console.log(`\n=== Migration Complete ===`);
    console.log(`Updated: ${updated} users`);
    console.log(`Skipped: ${skipped} users`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateProgramType();
