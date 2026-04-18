import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now
        },
        duration: {
            type: Number, // in minutes
        },
        totalMarks: {
            type: Number,
            required: true,
            default: 100
        },
        subject: {
            type: String,
        },
        classLevel: {
            type: String,
        },
        examCategory: {
            type: String,
            enum: ["scheduled", "practice"],
            default: "scheduled",
        },
        examType: {
            type: String,
            enum: ["official", "subject-wise", "mock"],
            default: "subject-wise",
        },
        programType: {
            type: String,
            enum: ["PrimeOne", "Cluster", "PlanB", "Deep Roots", "E-Zone"],
            default: "PrimeOne",
        },
        sections: [
            {
                name: String, // e.g., 'Physics', 'Chemistry', 'Botany', 'Zoology'
                totalQuestions: Number,
                attendQuestions: Number,
            }
        ],
        totalQuestions: {
            type: Number,
            default: 0,
        },
        marksPerQuestion: {
            type: Number,
            default: 1,
        },
        negativeMarks: {
            type: Number,
            default: 0, // e.g. 0.25 or 0.33 for 1/4 or 1/3 negative marking
        },
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classroom",
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isNeetPattern: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
    },
    {
        timestamps: true,
    }
);

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
