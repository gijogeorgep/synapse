import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true,
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
    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
