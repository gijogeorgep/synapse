
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Get a student
        const student = await mongoose.connection.db.collection('users').findOne({ role: 'student' });
        if (!student) {
            console.log("No student found");
        } else {
            console.log("\n--- Student Info ---");
            console.log("ID:", student._id);
            console.log("Email:", student.email);
            console.log("userType:", student.userType);
            console.log("enrolledClassrooms:", student.enrolledClassrooms);

            // Classrooms student is in
            const classrooms = await mongoose.connection.db.collection('classrooms').find({ 
                students: student._id 
            }).toArray();
            console.log("\n--- Classrooms student is assigned to ---");
            classrooms.forEach(c => console.log(` - ${c.name} (${c._id})`));

            const classroomIds = [
                ...classrooms.map(c => c._id.toString()),
                ...(student.enrolledClassrooms || []).map(id => id.toString())
            ];

            // Latest materials
            const materials = await mongoose.connection.db.collection('studymaterials').find().sort({ createdAt: -1 }).limit(5).toArray();
            console.log("\n--- Latest Study Materials ---");
            materials.forEach(m => {
                const match = !m.classroom || m.classroom === "" || classroomIds.includes(m.classroom.toString());
                console.log(`Title: ${m.title}`);
                console.log(` - Classroom in Material: ${m.classroom}`);
                console.log(` - Would be visible? ${match}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

diagnose();
