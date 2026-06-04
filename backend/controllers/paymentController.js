import Razorpay from "razorpay";
import crypto from "crypto";
import { Payment, Subscription, Expense } from "../models/Financial.js";
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

const getFrontendUrl = () =>
    (process.env.FRONTEND_URL || process.env.VITE_SITE_URL || "https://synapseeduhub.com").replace(/\/$/, "");

const verifySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    return expectedSignature === razorpay_signature;
};

const completeEnrollmentForOrder = async ({ razorpay_order_id, razorpay_payment_id, classroomId }) => {
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
        throw new Error("Payment record not found for this order.");
    }

    const finalClassroomId = payment.classroom || classroomId;
    if (!finalClassroomId) {
        throw new Error("Classroom not found for this payment.");
    }

    payment.status = "completed";
    payment.paymentId = razorpay_payment_id;
    await payment.save();

    const user = await User.findById(payment.student);
    const classroom = await Classroom.findById(finalClassroomId);

    if (!user || !classroom) {
        throw new Error("User or Classroom not found during verification.");
    }

    const alreadyInUser = user.enrolledClassrooms.some((id) => id.toString() === finalClassroomId.toString());
    if (!alreadyInUser) {
        user.enrolledClassrooms.push(finalClassroomId);
        await user.save();
    }

    const alreadyInClassroom = classroom.students.some((id) => id.toString() === user._id.toString());
    if (!alreadyInClassroom) {
        classroom.students.push(user._id);
        await classroom.save();
    }

    return { user, classroom };
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

        const amount = Math.round(Number(classroom.price) * 100);

        const options = {
            amount, // Razorpay expects amount in paise
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
            classroom: classroom._id,
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

        const isAuthentic = verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });

        if (isAuthentic) {
            await completeEnrollmentForOrder({ razorpay_order_id, razorpay_payment_id, classroomId });

            res.status(200).json({
                success: true,
                message: "Payment verified and enrollment successful"
            });
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

// @desc    Verify Razorpay Payment from Checkout callback URL
// @route   POST /api/payments/callback
// @access  Public (Razorpay callback)
export const handlePaymentCallback = async (req, res) => {
    const frontendUrl = getFrontendUrl();

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.redirect(`${frontendUrl}/student/select-classroom?payment=failed`);
        }

        const isAuthentic = verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });

        if (!isAuthentic) {
            const payment = await Payment.findOne({ orderId: razorpay_order_id });
            if (payment) {
                payment.status = "failed";
                await payment.save();
            }
            return res.redirect(`${frontendUrl}/student/select-classroom?payment=failed`);
        }

        await completeEnrollmentForOrder({ razorpay_order_id, razorpay_payment_id });

        return res.redirect(`${frontendUrl}/student/dashboard?payment=success`);
    } catch (error) {
        console.error("Error handling Razorpay callback:", error);
        return res.redirect(`${frontendUrl}/student/select-classroom?payment=failed`);
    }
};

// @desc    Get all payments (Admin)
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getAdminPayments = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};
        
        if (status) {
            query.status = status;
        }

        let payments = await Payment.find(query)
            .populate("student", "name email phoneNumber")
            .sort({ paymentDate: -1, createdAt: -1 });

        if (search) {
            const searchLower = search.toLowerCase();
            payments = payments.filter(p => 
                (p.student && (p.student.name.toLowerCase().includes(searchLower) || p.student.email.toLowerCase().includes(searchLower))) ||
                (p.studentName && p.studentName.toLowerCase().includes(searchLower)) ||
                (p.paymentId && p.paymentId.toLowerCase().includes(searchLower)) ||
                (p.orderId && p.orderId.toLowerCase().includes(searchLower))
            );
        }

        res.status(200).json(payments);
    } catch (error) {
        console.error("Error fetching admin payments:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get payment and subscription dashboard stats (Admin)
// @route   GET /api/admin/payments/stats
// @access  Private/Admin
export const getAdminPaymentStats = async (req, res) => {
    try {
        const payments = await Payment.find({});
        const activeSubsCount = await Subscription.countDocuments({
            status: "active",
            expiryDate: { $gt: new Date() }
        });

        let totalRevenue = 0;
        let successCount = 0;
        let pendingCount = 0;
        let failedCount = 0;

        payments.forEach(p => {
            if (p.status === "completed") {
                totalRevenue += p.amount;
                successCount++;
            } else if (p.status === "pending") {
                pendingCount++;
            } else if (p.status === "failed") {
                failedCount++;
            }
        });

        // Calculate total expenses
        const expenseAgg = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].total : 0;
        const profit = totalRevenue - totalExpense;

        res.status(200).json({
            totalRevenue,
            totalExpense,
            profit,
            successCount,
            pendingCount,
            failedCount,
            activeSubscriptionsCount: activeSubsCount
        });
    } catch (error) {
        console.error("Error fetching payment stats:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all subscriptions (Admin)
// @route   GET /api/admin/subscriptions
// @access  Private/Admin
export const getAdminSubscriptions = async (req, res) => {
    try {
        const { search } = req.query;
        let subscriptions = await Subscription.find({})
            .populate("student", "name email")
            .populate("material", "title")
            .sort({ createdAt: -1 });

        if (search) {
            const searchLower = search.toLowerCase();
            subscriptions = subscriptions.filter(s => 
                (s.student && (s.student.name.toLowerCase().includes(searchLower) || s.student.email.toLowerCase().includes(searchLower))) ||
                (s.material && s.material.title.toLowerCase().includes(searchLower)) ||
                s.type.toLowerCase().includes(searchLower)
            );
        }

        res.status(200).json(subscriptions);
    } catch (error) {
        console.error("Error fetching admin subscriptions:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create manual subscription (Admin)
// @route   POST /api/admin/subscriptions
// @access  Private/Admin
export const createAdminSubscription = async (req, res) => {
    try {
        const { student, type, material, expiryDate } = req.body;

        if (!student || !type) {
            return res.status(400).json({ message: "Student and subscription type are required." });
        }

        const subscriptionData = {
            student,
            type,
            status: "active",
            expiryDate: expiryDate ? new Date(expiryDate) : undefined
        };

        if (type === "material") {
            if (!material) {
                return res.status(400).json({ message: "Material is required for material type subscription." });
            }
            subscriptionData.material = material;
        }

        const newSubscription = await Subscription.create(subscriptionData);
        const populated = await Subscription.findById(newSubscription._id)
            .populate("student", "name email")
            .populate("material", "title");

        res.status(201).json(populated);
    } catch (error) {
        console.error("Error creating admin subscription:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel/delete subscription (Admin)
// @route   DELETE /api/admin/subscriptions/:id
// @access  Private/Admin
export const cancelAdminSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findByIdAndDelete(id);
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found." });
        }
        res.status(200).json({ message: "Subscription cancelled successfully." });
    } catch (error) {
        console.error("Error cancelling admin subscription:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create manual offline payment (Admin)
// @route   POST /api/admin/payments/manual
// @access  Private/Admin
export const createManualPayment = async (req, res) => {
    try {
        const { studentId, studentName, classLevel, amount, paymentMethod, paymentDate, remarks } = req.body;

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ message: "A valid amount is required." });
        }

        const paymentData = {
            amount: Number(amount),
            status: "completed",
            paymentMethod: paymentMethod || "offline",
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            remarks,
            createdBy: req.user._id,
        };

        if (studentId) {
            paymentData.student = studentId;
            const studentUser = await User.findById(studentId);
            if (studentUser) {
                paymentData.studentName = studentUser.name;
                paymentData.classLevel = classLevel || "";
            }
        } else {
            if (!studentName) {
                return res.status(400).json({ message: "Student Name is required for offline unregistered students." });
            }
            paymentData.studentName = studentName;
            paymentData.classLevel = classLevel || "";
        }

        // Generate unique IDs for admin manual tracking
        const timestamp = Date.now();
        paymentData.paymentId = `MANUAL-${timestamp}`;
        paymentData.orderId = `MANUAL-ORD-${timestamp}`;

        const newPayment = await Payment.create(paymentData);
        
        let populated = newPayment;
        if (newPayment.student) {
            populated = await Payment.findById(newPayment._id).populate("student", "name email phoneNumber");
        }

        res.status(201).json(populated);
    } catch (error) {
        console.error("Error creating manual payment:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete payment record (Admin)
// @route   DELETE /api/admin/payments/:id
// @access  Private/Admin
export const deleteAdminPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findByIdAndDelete(id);
        if (!payment) {
            return res.status(404).json({ message: "Payment record not found." });
        }
        res.status(200).json({ message: "Payment record deleted successfully." });
    } catch (error) {
        console.error("Error deleting payment record:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create expense record (Admin)
// @route   POST /api/admin/expenses
// @access  Private/Admin
export const createExpense = async (req, res) => {
    try {
        const { title, category, amount, description, expenseDate } = req.body;

        if (!title || !amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ message: "Title and a valid amount are required." });
        }

        const expense = await Expense.create({
            title,
            category: category || "other",
            amount: Number(amount),
            description,
            expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
            createdBy: req.user._id,
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all expenses (Admin)
// @route   GET /api/admin/expenses
// @access  Private/Admin
export const getExpenses = async (req, res) => {
    try {
        const { search } = req.query;
        let expenses = await Expense.find({})
            .populate("createdBy", "name email")
            .sort({ expenseDate: -1, createdAt: -1 });

        if (search) {
            const searchLower = search.toLowerCase();
            expenses = expenses.filter(e =>
                e.title.toLowerCase().includes(searchLower) ||
                (e.description && e.description.toLowerCase().includes(searchLower)) ||
                e.category.toLowerCase().includes(searchLower)
            );
        }

        res.status(200).json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete expense record (Admin)
// @route   DELETE /api/admin/expenses/:id
// @access  Private/Admin
export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findByIdAndDelete(id);
        if (!expense) {
            return res.status(404).json({ message: "Expense record not found." });
        }
        res.status(200).json({ message: "Expense record deleted successfully." });
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update expense record (Admin)
// @route   PUT /api/admin/expenses/:id
// @access  Private/Admin
export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, amount, description, expenseDate } = req.body;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: "Expense record not found." });
        }

        if (title) expense.title = title;
        if (category) expense.category = category;
        if (amount !== undefined) expense.amount = amount;
        if (description !== undefined) expense.description = description;
        if (expenseDate) expense.expenseDate = new Date(expenseDate);

        await expense.save();
        res.status(200).json(expense);
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ message: error.message });
    }
};

