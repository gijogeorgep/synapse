
import mongoose from "mongoose";
import User from "./backend/models/User.js";
import Classroom from "./backend/models/Classroom.js";
import StudyMaterial from "./backend/models/StudyMaterial.js";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Check all materials and their classroom fields
        const materials = await StudyMaterial.find({});
        console.log(`\n--- Total Materials: ${materials.length} ---`);
        materials.forEach(m => {
            console.log(`Title: ${m.title}, Classroom: ${m.classroom}, Category: ${m.category}`);
        });

        // 2. Check a sample student
        const student = await User.findOne({ role: "student" });
        if (student) {
            console.log(`\n--- Sample Student: ${student.name} (${student.email}) ---`);
            console.log(`userType: ${student.userType}`);
            console.log(`enrolledClassrooms: ${student.enrolledClassrooms}`);
            
            // Find classrooms they are in
            const classes = await Classroom.find({ students: student._id });
            console.log(`Classrooms via 'students' array: ${classes.map(c => c.name)}`);
            
            const classroomIds = [
                ...classes.map(c => c._id.toString()),
                ...(student.enrolledClassrooms || []).map(id => id.toString())
            ];
            
            console.log(`Effective Classroom IDs: ${classroomIds}`);
            
            // Simulate the query in materialController.js
            const query = {
                $or: [
                    { classroom: { $in: classroomIds } },
                    { classroom: null },
                    { classroom: "" },
                    { classroom: { $exists: false } }
                ]
            };
            
            const visibleMaterials = await StudyMaterial.find(query);
            console.log(`Visible Materials for this student: ${visibleMaterials.length}`);
            visibleMaterials.forEach(m => {
                console.log(` - ${m.title}`);
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

diagnose();
