import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Classroom from './models/Classroom.js';
import Counter from './models/Counter.js';

dotenv.config();

const seedClassrooms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Define classrooms for all program types
    const classroomsToCreate = [
      // E-Zone classrooms (entrance exams)
      {
        name: 'NEET Entrance Prep',
        programType: 'E-Zone',
        className: 'NEET',
        board: 'Entrance/Exam',
        subjects: ['Biology', 'Chemistry', 'Physics'],
        type: 'NEET',
        isPublished: true,
        showOnHome: true,
        description: 'Comprehensive NEET preparation with expert guidance',
        price: 0,
      },
      {
        name: 'JEE Entrance Prep',
        programType: 'E-Zone',
        className: 'JEE',
        board: 'Entrance/Exam',
        subjects: ['Mathematics', 'Chemistry', 'Physics'],
        type: 'JEE',
        isPublished: true,
        showOnHome: true,
        description: 'Complete JEE preparation for engineering aspirants',
        price: 0,
      },
      {
        name: 'PSC Exam Prep',
        programType: 'E-Zone',
        className: 'PSC',
        board: 'Entrance/Exam',
        subjects: ['General Knowledge', 'English', 'Mathematics'],
        type: 'PSC',
        isPublished: true,
        showOnHome: true,
        description: 'Focused PSC exam preparation',
        price: 0,
      },

      // PrimeOne classrooms (classes 8-12)
      { name: 'Class 8 - PrimeOne', programType: 'PrimeOne', className: '8', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 9 - PrimeOne', programType: 'PrimeOne', className: '9', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 10 - PrimeOne', programType: 'PrimeOne', className: '10', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 11 - PrimeOne', programType: 'PrimeOne', className: '11', board: 'State', subjects: ['English', 'Mathematics', 'Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 12 - PrimeOne', programType: 'PrimeOne', className: '12', board: 'State', subjects: ['English', 'Mathematics', 'Science'], type: 'Other', isPublished: true, price: 0 },

      // Cluster classrooms (classes 8-12)
      { name: 'Class 8 - Cluster', programType: 'Cluster', className: '8', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 9 - Cluster', programType: 'Cluster', className: '9', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 10 - Cluster', programType: 'Cluster', className: '10', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 11 - Cluster', programType: 'Cluster', className: '11', board: 'State', subjects: ['English', 'Mathematics', 'Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 12 - Cluster', programType: 'Cluster', className: '12', board: 'State', subjects: ['English', 'Mathematics', 'Science'], type: 'Other', isPublished: true, price: 0 },

      // PlanB classrooms (classes 8-12)
      { name: 'Class 8 - PlanB', programType: 'PlanB', className: '8', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 9 - PlanB', programType: 'PlanB', className: '9', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 10 - PlanB', programType: 'PlanB', className: '10', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 11 - PlanB', programType: 'PlanB', className: '11', board: 'State', subjects: ['English', 'Mathematics', 'Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 12 - PlanB', programType: 'PlanB', className: '12', board: 'State', subjects: ['English', 'Mathematics', 'Science'], type: 'Other', isPublished: true, price: 0 },

      // Deep Roots classrooms (classes 8-12)
      { name: 'Class 8 - Deep Roots', programType: 'Deep Roots', className: '8', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 9 - Deep Roots', programType: 'Deep Roots', className: '9', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 10 - Deep Roots', programType: 'Deep Roots', className: '10', board: 'State', subjects: ['English', 'Mathematics', 'Science', 'Social Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 11 - Deep Roots', programType: 'Deep Roots', className: '11', board: 'State', subjects: ['English', 'Mathematics', 'Science'], type: 'Other', isPublished: true, price: 0 },
      { name: 'Class 12 - Deep Roots', programType: 'Deep Roots', className: '12', board: 'State', subjects: ['English', 'Mathematics', 'Science'], type: 'Other', isPublished: true, price: 0 },
    ];

    // Check which classrooms already exist
    const existingCount = await Classroom.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing classrooms. Checking for missing ones...`);
      
      // Check for each classroom if it exists
      let createCount = 0;
      for (const classroom of classroomsToCreate) {
        const exists = await Classroom.findOne({
          programType: classroom.programType,
          className: classroom.className
        });
        
        if (!exists) {
          await Classroom.create(classroom);
          createCount++;
          console.log(`✅ Created: ${classroom.name}`);
        }
      }
      
      if (createCount === 0) {
        console.log('✓ All classrooms already exist.');
      } else {
        console.log(`✅ Created ${createCount} new classrooms.`);
      }
    } else {
      // Create all classrooms if none exist
      await Classroom.insertMany(classroomsToCreate);
      console.log(`✅ Seeded ${classroomsToCreate.length} classrooms for all program types`);
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
