import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Program from '../models/Program.js';

dotenv.config();

const updateSlugs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const programs = await Program.find({ slug: { $exists: false } });
    console.log(`Found ${programs.length} programs without slugs.`);
    
    for (const program of programs) {
        const slug = program.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        
        program.slug = slug;
        await program.save();
        console.log(`Updated slug for: ${program.title} -> ${slug}`);
    }
    
    console.log('All program slugs updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateSlugs();
