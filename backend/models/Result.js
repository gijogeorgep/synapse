import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true,
        },
        score: {
            type: Number,
        },
        marksObtained: {
            type: Number,
        },
        remarks: {
            type: String,
        },
        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                },
                selectedOption: Number,
                isCorrect: Boolean,
            },
        ],
        timeTaken: {
            type: Number, // in seconds
        },
    },
    {
        timestamps: true,
    }
);

const Result = mongoose.model("Result", resultSchema);

export default Result;
