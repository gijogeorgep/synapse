import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        // Delete all classrooms that have type NEET, JEE, or PSC and are not published
        const Classroom = mongoose.model('Classroom', new mongoose.Schema({ type: String, isPublished: Boolean }, { strict: false }));
        const result = await Classroom.deleteMany({ type: { $in: ['NEET', 'JEE', 'PSC'] } });
        
        console.log('Deleted dummy classrooms:', result);
        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
