import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
        },
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classroom",
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        questionText: {
            type: String,
            required: true,
        },
        options: [
            {
                type: String,
                required: true,
            },
        ],
        correctAnswer: {
            type: Number, // index of options array (0-3)
            required: true,
        },
        explanation: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        sectionName: {
            type: String, // e.g., 'Physics', 'Chemistry', 'Biology'
        },
    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
