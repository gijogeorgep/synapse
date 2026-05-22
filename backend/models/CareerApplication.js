import mongoose from "mongoose";

const careerApplicationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        appliedVacancy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vacancy",
            default: null, // Null means general spontaneous application
        },
        generalRole: {
            type: String,
            trim: true,
        },
        subject: {
            type: String,
            trim: true,
        },
        classLevel: {
            type: String,
            trim: true,
        },
        experience: {
            type: String,
            trim: true,
        },
        resumeUrl: {
            type: String,
            required: true,
        },
        resumePublicId: {
            type: String,
        },
        coverLetter: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Applied", "Reviewing", "Shortlisted", "Rejected"],
            default: "Applied",
        },
    },
    {
        timestamps: true,
    }
);

const CareerApplication = mongoose.model("CareerApplication", careerApplicationSchema);

export default CareerApplication;
