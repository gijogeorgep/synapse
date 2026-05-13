import mongoose from "mongoose";

const enquiryResponseSchema = new mongoose.Schema(
    {
        form: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EnquiryForm",
            required: true,
        },
        responses: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            required: true,
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

const EnquiryResponse = mongoose.model("EnquiryResponse", enquiryResponseSchema);

export default EnquiryResponse;
