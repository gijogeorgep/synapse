import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendContactInquiryEmail } from "../utils/emailService.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactForm = async (req, res) => {
    try {
        const {
            name = "",
            email = "",
            program = "",
            message = "",
        } = req.body || {};

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedProgram = program.trim();
        const trimmedMessage = message.trim();

        if (!trimmedName || !trimmedEmail || !trimmedMessage) {
            return res.status(400).json({ message: "Name, email, and message are required." });
        }

        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }

        const superAdmins = await User.find(
            { role: "superadmin" },
            { email: 1, name: 1 }
        ).lean();

        const recipientEmails = [...new Set([
            ...superAdmins.map((user) => user.email).filter(Boolean),
            ...(process.env.SUPERADMIN_EMAIL ? [process.env.SUPERADMIN_EMAIL] : []),
        ])];

        if (recipientEmails.length === 0) {
            return res.status(500).json({
                message: "No super admin email is configured to receive contact messages.",
            });
        }

        await sendContactInquiryEmail({
            recipientEmails,
            name: trimmedName,
            email: trimmedEmail,
            program: trimmedProgram,
            message: trimmedMessage,
        });

        const notificationPayloads = superAdmins.map((superAdmin) => ({
            recipient: superAdmin._id,
            title: "New Contact Form Message",
            message: `${trimmedName} sent a contact inquiry${trimmedProgram ? ` about ${trimmedProgram}` : ""}. ${trimmedMessage.slice(0, 140)}${trimmedMessage.length > 140 ? "..." : ""}`,
            type: "general",
            link: "/notifications",
        }));

        if (notificationPayloads.length > 0) {
            await Notification.insertMany(notificationPayloads);
        }

        return res.status(200).json({ message: "Message sent successfully." });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return res.status(500).json({ message: "Failed to send message. Please try again later." });
    }
};
