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
            required: true,
            default: Date.now
        },
        duration: {
            type: Number, // in minutes
            required: true,
        },
        totalMarks: {
            type: Number,
            required: true,
            default: 100
        },
        subject: {
            type: String,
            required: true,
        },
        classLevel: {
            type: String,
            required: true,
        },
        examType: {
            type: String,
            enum: ["official", "subject-wise"],
            default: "subject-wise",
        },
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classroom",
            required: true,
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
    },
    {
        timestamps: true,
    }
);

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
