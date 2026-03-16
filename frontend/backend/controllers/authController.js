import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password, role, phoneNumber, class: userClass, subjects } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Prevent admin registration through public route
    if (role === 'admin' || role === 'superadmin') {
        return res.status(403).json({ message: "Admin registration not allowed here" });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || "student",
            phoneNumber: phoneNumber || "",
            class: userClass || "",
            subjects: subjects || [],
            userType: "independent",
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                class: user.class,
                subjects: user.subjects,
                token: generateToken(user._id),
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

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                class: user.class,
                subjects: user.subjects,
                token: generateToken(user._id),
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
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
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
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
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
            console.log(`Password match: ${isMatch}`);
            
            if (isMatch) {
                if (user.role !== 'admin' && user.role !== 'superadmin') {
                    console.log(`Unauthorized role: ${user.role}`);
                    return res.status(403).json({ message: "Not authorized as admin" });
                }

                const token = generateToken(user._id);
                console.log(`Token generated successfully`);

                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: token,
                });
            }
        }

        console.log("Invalid credentials or user not found");
        res.status(401).json({ message: "Invalid email or password" });
    } catch (error) {
        console.error("ADMIN LOGIN ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};
