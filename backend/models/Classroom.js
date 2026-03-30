import mongoose from "mongoose";

const classroomSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        programType: {
            type: String,
            enum: ["PrimeOne", "Cluster", "PlanB", "Deep Roots", "E-Zone"],
            required: true,
            default: "PrimeOne",
        },
        className: { // renamed from 'class' because it's a reserved keyword in JS if destructured, but we can stick to 'className' or 'standard'
            type: String, // e.g., '10', '9', 'N/A'
            required: true,
        },
        board: {
            type: String,
            enum: ["State", "CBSE", "ICSE", "Entrance/Exam", "Other"],
            required: true,
            default: "State",
        },
        subjects: {
            type: [String],
            default: [],
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        teachers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        onlineClassLink: {
            type: String,
            default: "",
        },
        lectureNotes: [
            {
                title: String,
                url: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        price: {
            type: Number,
            default: 0,
        },
        type: {
            type: String,
            enum: ["NEET", "JEE", "PSC", "Other"],
            default: "Other",
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        showOnHome: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            default: "",
        },
        imageUrl: {
            type: String,
            default: "",
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

const Classroom = mongoose.model("Classroom", classroomSchema);

export default Classroom;
