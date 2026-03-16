import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        fileType: {
            type: String,
            enum: ["pdf", "video", "note"],
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        board: {
            type: String,
            enum: ["State", "CBSE", "ICSE", "Other"],
        },
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classroom",
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        price: {
            type: Number,
            default: 0,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const StudyMaterial = mongoose.model("StudyMaterial", studyMaterialSchema);

export default StudyMaterial;
