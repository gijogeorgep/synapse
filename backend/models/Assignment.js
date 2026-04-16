import mongoose from "mongoose";

const assignmentSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        dueDate: {
            type: Date,
            required: true,
        },
        maxPoints: {
            type: Number,
            required: true,
            default: 100,
            min: 1,
        },
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Classroom",
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        attachments: [
            {
                title: String,
                url: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
