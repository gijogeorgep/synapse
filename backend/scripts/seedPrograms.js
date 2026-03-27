import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Program from "../models/Program.js";

dotenv.config({ path: "./backend/.env" });

const programs = [
  {
    title: "PRIME ONE",
    tagline: "Personalized Learning, Maximum Focus",
    subtitle: "Individual Tuition Program",
    description: "Comprehensive academic support with 1-on-1 attention for students in classes 4–10.",
    features: [
      "1-on-1 Personalized Attention",
      "Customized Learning Path",
      "Instant Doubt Resolution",
      "Flexible Smart Scheduling",
      "Focused Exam Prep",
      "Digital Progress Tracking",
    ],
    imageUrl: "", // Images are currently from assets, will need to be uploaded or use placeholders
    badge: "Most Popular",
    iconName: "Zap",
    gradient: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)",
    glowColor: "rgba(6,182,212,0.4)",
    accentColor: "#06b6d4",
    pill: { bg: "rgba(6,182,212,0.1)", color: "#0891b2", border: "rgba(6,182,212,0.2)" },
    order: 1,
    isPublished: true,
  },
  {
    title: "PLAN B",
    tagline: "Smart planning for stress-free success",
    subtitle: "Exclusive Revision Program",
    description: "Intensive exam-oriented revision designed specifically for Class 10+ students.",
    features: [
      "Structured Macro Revision",
      "Exam-Oriented Strategies",
      "Deep Concept Reinforcement",
      "Time Management Mastery",
      "Daily Practice Sessions",
      "Performance Evaluation",
    ],
    imageUrl: "",
    badge: "Exam Ready",
    iconName: "BarChart3",
    gradient: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #14b8a6 100%)",
    glowColor: "rgba(20,184,166,0.4)",
    accentColor: "#14b8a6",
    pill: { bg: "rgba(20,184,166,0.1)", color: "#0d9488", border: "rgba(20,184,166,0.2)" },
    order: 2,
    isPublished: true,
  },
  {
    title: "CLUSTER",
    tagline: "Together Towards Excellence",
    subtitle: "Collaborative Learning",
    description: "Compact batch specialized learning that bridges peer interaction and expert guidance.",
    features: [
      "Ultra-Compact Batches",
      "Active Peer Learning",
      "Dynamic Doubt Sessions",
      "Interactive Class Design",
      "Focused Curriculum Map",
      "Continuous Monitoring",
    ],
    imageUrl: "",
    badge: "Best Value",
    iconName: "Users",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #3b82f6 100%)",
    glowColor: "rgba(59,130,246,0.4)",
    accentColor: "#3b82f6",
    pill: { bg: "rgba(59,130,246,0.1)", color: "#2563eb", border: "rgba(59,130,246,0.2)" },
    order: 3,
    isPublished: true,
  },
  {
    title: "DEEP ROOTS",
    tagline: "Foundation for a brighter future",
    subtitle: "Intensive Bridge Course",
    description: "A transition program designed to strengthen core concepts before the new academic year.",
    features: [
      "Core Subject Strengthening",
      "Gap Identification Tool",
      "Small Foundation Batches",
      "Accelerated Revision",
      "Transition Counseling",
      "Confidence Building",
    ],
    imageUrl: "",
    badge: "Essentials",
    iconName: "BookOpen",
    gradient: "linear-gradient(135deg, #075985 0%, #0369a1 50%, #0ea5e9 100%)",
    glowColor: "rgba(14,165,233,0.4)",
    accentColor: "#0ea5e9",
    pill: { bg: "rgba(14,165,233,0.1)", color: "#0369a1", border: "rgba(14,165,233,0.2)" },
    order: 4,
    isPublished: true,
  },
];

const seedPrograms = async () => {
    try {
        await connectDB();
        await Program.deleteMany({});
        await Program.insertMany(programs);
        console.log("Data Seeded Successfully!");
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedPrograms();
