import mongoose from "mongoose";

const studentProfileSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        uniqueId: {
            type: String,
            required: true,
            unique: true,
        },
        class: {
            type: String,
            required: true,
        },
        board: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        subjects: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;
