import mongoose from "mongoose";

const submissionSchema = mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Assignment",
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        fileUrl: {
            type: String,
            required: true,
        },
        fileName: {
            type: String,
            default: "submission",
        },
        status: {
            type: String,
            enum: ["Submitted", "Graded"],
            default: "Submitted",
        },
        grade: {
            type: String,
            default: "",
        },
        score: {
            type: Number,
            default: null,
        },
        feedback: {
            type: String,
            default: "",
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
