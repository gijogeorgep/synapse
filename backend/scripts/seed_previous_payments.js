import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { Payment } from "../models/Financial.js";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        // Find users to link if they exist
        const lujainUser = await User.findOne({ email: "shabnapkc@gmail.com" });
        const gouthamUser = await User.findOne({ email: "goutham@gmail.com" });

        const now = new Date();
        const getPastDate = (daysAgo) => {
            const date = new Date();
            date.setDate(now.getDate() - daysAgo);
            return date;
        };

        const seedData = [
            {
                student: gouthamUser ? gouthamUser._id : null,
                studentName: gouthamUser ? gouthamUser.name : "Goutham",
                classLevel: "12",
                amount: 12500,
                status: "completed",
                paymentMethod: "offline",
                paymentDate: getPastDate(45),
                remarks: "Previous student fee (completed course)",
                paymentId: "SEED-PREV-GAUTHAM",
                orderId: "SEED-PREV-ORD-GAUTHAM"
            },
            {
                student: null,
                studentName: "Adhesh",
                classLevel: "12",
                amount: 4200,
                status: "completed",
                paymentMethod: "offline",
                paymentDate: getPastDate(40),
                remarks: "Previous student fee (completed course)",
                paymentId: "SEED-PREV-ADHESH",
                orderId: "SEED-PREV-ORD-ADHESH"
            },
            {
                student: null,
                studentName: "Sreenandana",
                classLevel: "11",
                amount: 24600,
                status: "completed",
                paymentMethod: "offline",
                paymentDate: getPastDate(30),
                remarks: "Previous student fee (completed course)",
                paymentId: "SEED-PREV-SREENANDANA",
                orderId: "SEED-PREV-ORD-SREENANDANA"
            },
            {
                student: null,
                studentName: "Aflah",
                classLevel: "10",
                amount: 7500,
                status: "completed",
                paymentMethod: "offline",
                paymentDate: getPastDate(25),
                remarks: "Previous student fee (completed course)",
                paymentId: "SEED-PREV-AFLAH",
                orderId: "SEED-PREV-ORD-AFLAH"
            },
            {
                student: null,
                studentName: "Infa",
                classLevel: "4",
                amount: 2500,
                status: "completed",
                paymentMethod: "offline",
                paymentDate: getPastDate(15),
                remarks: "Previous student fee (completed course)",
                paymentId: "SEED-PREV-INFA",
                orderId: "SEED-PREV-ORD-INFA"
            },
            {
                student: null,
                studentName: "Karthik",
                classLevel: "5",
                amount: 1750,
                status: "completed",
                paymentMethod: "offline",
                paymentDate: getPastDate(10),
                remarks: "Previous student fee (completed course)",
                paymentId: "SEED-PREV-KARTHIK",
                orderId: "SEED-PREV-ORD-KARTHIK"
            },
            {
                student: lujainUser ? lujainUser._id : null,
                studentName: lujainUser ? lujainUser.name : "Lujain",
                classLevel: "9",
                amount: 11350,
                status: "completed",
                paymentMethod: "offline",
                paymentDate: getPastDate(2),
                remarks: "Ongoing student fee",
                paymentId: "SEED-PREV-LUJAIN",
                orderId: "SEED-PREV-ORD-LUJAIN"
            }
        ];

        console.log("Seeding previous student payments...");
        let count = 0;
        for (const data of seedData) {
            // Delete existing seed record if it exists to allow running multiple times safely
            await Payment.deleteMany({ paymentId: data.paymentId });
            
            await Payment.create(data);
            console.log(`Seeded payment for ${data.studentName}: ₹${data.amount}`);
            count++;
        }

        console.log(`Successfully seeded ${count} payment records.`);
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error seeding data:", err);
        process.exit(1);
    }
};

run();
