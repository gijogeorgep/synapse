import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Program from './models/Program.js';

dotenv.config();

const checkPrograms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const count = await Program.countDocuments();
    console.log(`Total programs found: ${count}`);
    
    const programs = await Program.find({});
    console.log('Programs:', JSON.stringify(programs, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPrograms();
