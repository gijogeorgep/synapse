import mongoose from "mongoose";

const teacherProfileSchema = mongoose.Schema(
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
        phoneNumber: {
            type: String,
            required: true,
        },
        subjects: {
            type: [String],
            default: [],
        },
        // For teachers, we let them teach multiple classes
        classes: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const TeacherProfile = mongoose.model("TeacherProfile", teacherProfileSchema);

export default TeacherProfile;
