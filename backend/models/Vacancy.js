import mongoose from "mongoose";

const vacancySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        requirements: {
            type: [String],
            default: [],
        },
        location: {
            type: String,
            default: "Mavoor, Calicut",
            trim: true,
        },
        type: {
            type: String,
            enum: ["Full-time", "Part-time", "Contract", "Internship"],
            default: "Full-time",
        },
        workMode: {
            type: String,
            enum: ["Offline", "Hybrid", "Online"],
            default: "Offline",
        },
        classLevel: {
            type: String,
            trim: true,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Vacancy = mongoose.model("Vacancy", vacancySchema);

export default Vacancy;
