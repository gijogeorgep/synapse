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
            required: false,
        },
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classroom",
        },
        studentName: String,
        classLevel: String,
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
        paymentMethod: {
            type: String,
            enum: ["online", "offline"],
            default: "online",
        },
        paymentDate: {
            type: Date,
            default: Date.now,
        },
        remarks: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

const expenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["salary", "rent", "utilities", "materials", "marketing", "software", "equipment", "travel", "maintenance", "other"],
            default: "other",
        },
        amount: {
            type: Number,
            required: true,
        },
        description: String,
        expenseDate: {
            type: Date,
            default: Date.now,
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

const Expense = mongoose.model("Expense", expenseSchema);

export { Subscription, Payment, Expense };
