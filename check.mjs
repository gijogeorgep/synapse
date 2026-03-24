import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Classroom from './backend/models/Classroom.js';
import StudyMaterial from './backend/models/StudyMaterial.js';
import User from './backend/models/User.js';

dotenv.config({ path: './backend/.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/synapse').then(async () => {
    console.log("Connected to DB");
    
    const materials = await StudyMaterial.find({});
    console.log("ALL MATERIALS:");
    console.log(JSON.stringify(materials, null, 2));

    const students = await User.find({ role: 'student' });
    console.log(`\nFound ${students.length} students`);
    if (students.length > 0) {
        const student = students[0];
        console.log(`First student: ${student.name} (${student.email}), type: ${student.userType}`);
        const classrooms = await Classroom.find({ students: student._id });
        console.log(`Student belongs to classrooms: ${classrooms.map(c => c.name).join(', ')}`);
    }

    mongoose.disconnect();
}).catch(e => console.error(e));
