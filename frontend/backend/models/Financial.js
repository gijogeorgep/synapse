import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudyMaterial",
        },
        type: {
            type: String,
            enum: ["material", "full-access"],
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "expired"],
            default: "active",
        },
        expiryDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

const paymentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        paymentId: String, // Razorpay or Stripe ID
        orderId: String,
    },
    {
        timestamps: true,
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

export { Subscription, Payment };
