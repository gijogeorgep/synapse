import mongoose from "mongoose";

const enquiryFormSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        fields: [
            {
                label: { type: String, required: true },
                type: { 
                    type: String, 
                    enum: ["text", "number", "email", "textarea", "select", "checkbox", "radio", "date"],
                    required: true 
                },
                options: [String], // For select, checkbox, radio
                required: { type: Boolean, default: false },
                placeholder: String,
            },
        ],
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

const EnquiryForm = mongoose.model("EnquiryForm", enquiryFormSchema);

export default EnquiryForm;
