import mongoose from "mongoose";

const programSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            unique: true,
            sparse: true, // Allow existing programs without codes initially
        },
        slug: {
            type: String,
            unique: true,
            sparse: true, // Allow existing programs without slugs initially
        },
        tagline: {
            type: String,
            default: "",
        },
        subtitle: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        features: {
            type: [String],
            default: [],
        },
        imageUrl: {
            type: String,
            default: "",
        },
        badge: {
            type: String,
            default: "",
        },
        iconName: {
            type: String,
            default: "Zap", // Default icon from Lucide
        },
        gradient: {
            type: String,
            default: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)",
        },
        glowColor: {
            type: String,
            default: "rgba(6,182,212,0.4)",
        },
        accentColor: {
            type: String,
            default: "#06b6d4",
        },
        pill: {
            bg: { type: String, default: "rgba(6,182,212,0.1)" },
            color: { type: String, default: "#0891b2" },
            border: { type: String, default: "rgba(6,182,212,0.2)" },
        },
        order: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        // Fields for detail page
        detailImageUrl: {
            type: String,
            default: "",
        },
        offerings: {
            type: [
                {
                    title: { type: String, required: true },
                    description: { type: String, default: "" },
                    icon: { type: String, default: "BookOpen" }, // Lucide icon name
                }
            ],
            default: [],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const Program = mongoose.model("Program", programSchema);

export default Program;
