import User from "../models/User.js";
import OTP from "../models/OTP.js";
import generateToken from "../utils/generateToken.js";
import { generateUniqueId } from "../utils/idGenerator.js";
import { sendRegistrationEmail, sendOTPEmail } from "../utils/emailService.js";
import crypto from "crypto";

// @desc    Send OTP for Registration
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }
        
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Remove any existing OTPs for this email to prevent spam conflicts
        await OTP.deleteMany({ email });
        
        await OTP.create({
            email,
            otp
        });
        
        await sendOTPEmail(email, otp);
        
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("OTP generation error:", error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password, phoneNumber, otp } = req.body;

    // Basic validation
    if (!name || !email || !password || !phoneNumber || !otp) {
        return res.status(400).json({ message: "Name, email, phone number, password, and OTP are required" });
    }

    // Phone Number Validation - Exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ""))) {
        return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }

        // Validate OTP (Allow 123456 for testing)
        const isDummyOTP = otp === '123456';
        let otpRecord = null;
        
        if (isDummyOTP) {
            otpRecord = { email, otp: '123456' };
        } else {
            otpRecord = await OTP.findOne({ email, otp });
        }

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const sessionToken = crypto.randomUUID();
        const user = await User.create({
            name,
            email,
            password,
            phoneNumber,
            role: "student",
            userType: "independent",
            sessionToken,
            // uniqueId will be generated during first enrollment to match the program prefix
        });
        if (user) {
            // Delete OTP record after successful use
            await OTP.deleteMany({ email });

            // Send Welcome Email asynchronously without awaiting to not block the request
            sendRegistrationEmail(user.email, user.name);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                uniqueId: user.uniqueId,
                userType: user.userType,
                token: generateToken(user._id, sessionToken),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Register error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt received for email: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Block admins from using the public login endpoint
            if (user.role === 'admin' || user.role === 'superadmin') {
                console.warn(`[AUTH] Admin account attempted login via main portal: ${email}`);
                return res.status(403).json({ 
                    message: "Admin accounts must login via the admin portal at admin.synapseeduhub.com" 
                });
            }

            const sessionToken = crypto.randomUUID();
            user.sessionToken = sessionToken;
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                userType: user.userType,
                avatarUrl: user.avatarUrl,
                uniqueId: user.uniqueId,
                phoneNumber: user.phoneNumber,
                class: user.class,
                subjects: user.subjects,
                token: generateToken(user._id, sessionToken),
            });
        } else {
            res.status(401).json({ message: "Incorrect email or password" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Migration: Generate uniqueId if missing for existing users
        if (!user.uniqueId) {
            user.uniqueId = await generateUniqueId(user.role, user.class);
            await user.save();
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            userType: user.userType,
            uniqueId: user.uniqueId,
            phoneNumber: user.phoneNumber,
            avatarUrl: user.avatarUrl,
            class: user.class,
            subjects: user.subjects,
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        
        if (req.body.phoneNumber) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(req.body.phoneNumber.replace(/\s+/g, ""))) {
                return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
            }
            user.phoneNumber = req.body.phoneNumber;
        }
        
        user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            userType: updatedUser.userType,
            uniqueId: updatedUser.uniqueId,
            phoneNumber: updatedUser.phoneNumber,
            avatarUrl: updatedUser.avatarUrl,
            class: updatedUser.class,
            subjects: updatedUser.subjects,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

// @desc    Update user password
// @route   PUT /api/auth/profile/password
// @access  Private
export const updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
        user.password = newPassword;
        await user.save();
        res.json({ message: "Password updated successfully" });
    } else {
        res.status(401).json({ message: "Invalid current password" });
    }
};


// @desc    Login for admin
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        console.log(`Login attempt for: ${email}, found user: ${user ? 'yes' : 'no'}`);

        if (user) {
            const isMatch = await user.matchPassword(password);
            console.log(`[AUTH] Login attempt for ${email} - User found, Password match: ${isMatch}`);

            if (isMatch) {
                if (user.role !== 'admin' && user.role !== 'superadmin') {
                    console.warn(`[AUTH] Unauthorized role access attempt: ${email} has role ${user.role}`);
                    return res.status(403).json({ message: "Not authorized as administrator. Access denied." });
                }

                const sessionToken = crypto.randomUUID();
                user.sessionToken = sessionToken;
                await user.save();

                const token = generateToken(user._id, sessionToken);
                console.log(`[AUTH] Admin login successful: ${email} (${user.role})`);

                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    uniqueId: user.uniqueId,
                    phoneNumber: user.phoneNumber,
                    token: token,
                });
            } else {
                console.warn(`[AUTH] Login failed: Incorrect password for ${email}`);
            }
        } else {
            console.warn(`[AUTH] Login failed: User not found for ${email}`);
        }

        return res.status(401).json({ message: "Invalid email or security key" });
    } catch (error) {
        console.error("CRITICAL ADMIN LOGIN ERROR:", error);
        return res.status(500).json({
            message: "Internal server error during authentication",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// @desc    Logout user & clear session
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.sessionToken = null;
            await user.save();
        }
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
