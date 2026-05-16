import Razorpay from "razorpay";
import crypto from "crypto";
import { Payment } from "../models/Financial.js";
import Classroom from "../models/Classroom.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Helper to get Razorpay instance (prevents crash if env vars missing at boot)
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error("Razorpay Key ID or Secret is missing in environment variables.");
    }

    return new Razorpay({ key_id, key_secret });
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { classroomId } = req.body;
        const classroom = await Classroom.findById(classroomId);

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        if (!classroom.price || classroom.price <= 0) {
            return res.status(400).json({ message: "This classroom is not for sale or has no price set." });
        }

        const options = {
            amount: classroom.price * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ message: "Failed to create Razorpay order" });
        }

        // Save pending payment to DB
        await Payment.create({
            student: req.user._id,
            amount: classroom.price,
            status: "pending",
            orderId: order.id,
        });

        res.status(201).json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            classroomId
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment success
            const payment = await Payment.findOne({ orderId: razorpay_order_id });
            if (payment) {
                payment.status = "completed";
                payment.paymentId = razorpay_payment_id;
                await payment.save();
            }

            // Enroll student in classroom
            const user = await User.findById(req.user._id);
            const classroom = await Classroom.findById(classroomId);

            if (user && classroom) {
                // Add classroom to user's enrolled list if not already there
                if (!user.enrolledClassrooms.includes(classroomId)) {
                    user.enrolledClassrooms.push(classroomId);
                    await user.save();
                }

                // Add user to classroom's students list if not already there
                if (!classroom.students.includes(req.user._id)) {
                    classroom.students.push(req.user._id);
                    await classroom.save();
                }

                res.status(200).json({
                    success: true,
                    message: "Payment verified and enrollment successful"
                });
            } else {
                res.status(404).json({ message: "User or Classroom not found during verification" });
            }
        } else {
            // Signature mismatch
            const payment = await Payment.findOne({ orderId: razorpay_order_id });
            if (payment) {
                payment.status = "failed";
                await payment.save();
            }
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        res.status(500).json({ message: error.message });
    }
};
