import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Classroom from './models/Classroom.js';
import Counter from './models/Counter.js';

dotenv.config();

const classrooms = [];

const seedClassrooms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if these types already exist to avoid duplicates if re-run
    const existing = await Classroom.find({ type: { $in: ['NEET', 'JEE', 'PSC'] } });
    if (existing.length > 0) {
      console.log('Public classrooms already exist. Skipping seed.');
    } else {
      await Classroom.insertMany(classrooms);
      console.log('Seeded NEET, JEE, and PSC classrooms');
    }

    // Ensure Counter starts correctly if not present
    const studentCounter = await Counter.findOne({ id: 'student_NEET' });
    if (!studentCounter) {
        console.log('Initializing counters...');
        // We don't necessarily need to seed all counters here as the generator handles it,
        // but it's good to know they'll start from 1000 (sequence 1001).
    }

    mongoose.disconnect();
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedClassrooms();
