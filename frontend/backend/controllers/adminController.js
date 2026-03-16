import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import TeacherProfile from "../models/TeacherProfile.js";
import Classroom from "../models/Classroom.js";
import StudyMaterial from "../models/StudyMaterial.js";
import Announcement from "../models/Announcement.js";
import AuditLog from "../models/AuditLog.js";
import { generateUniqueId } from "../utils/idGenerator.js";
import { generateInitialPassword } from "../utils/authUtils.js";

// @desc    Create a new user (Student or Teacher)
// @route   POST /api/admin/users
// @access  Private/Admin
export const createAdminUser = async (req, res) => {
    try {
        const { name, email, password, role, phoneNumber, className, board, subjects, uniqueId } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ message: "Please provide all required fields (name, email, role)" });
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        // Phone Number Validation (if provided) - Exactly 10 digits
        if (phoneNumber) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ""))) {
                return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
            }
        }

        // Only superadmin can create other admins
        if (role === 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: "Only Super Admins can create admin accounts" });
        }
        
        // No one can create a superadmin through this route
        if (role === 'superadmin') {
            return res.status(403).json({ message: "Super Admin accounts cannot be created this way" });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Auto-generate Unique ID if not provided
        let finalUniqueId = uniqueId;
        if (!finalUniqueId) {
            if (role === 'student') {
                finalUniqueId = await generateUniqueId(role, className, board);
            } else if (role === 'teacher') {
                finalUniqueId = await generateUniqueId(role);
            }
        }

        // Auto-generate Password if not provided
        let finalPassword = password;
        if (!finalPassword) {
            finalPassword = generateInitialPassword(name, phoneNumber);
        }

        const user = await User.create({
            name,
            email,
            password: finalPassword,
            role,
            phoneNumber,
            class: className,
            subjects: subjects || [],
            userType: 'institutional',
            uniqueId: finalUniqueId,
        });

        if (user) {
            // Also create their respective profiles if needed
            if (role === 'student' && finalUniqueId && className && board) {
                await StudentProfile.create({
                    user: user._id,
                    uniqueId: finalUniqueId,
                    class: className,
                    board,
                    phoneNumber: phoneNumber || "",
                    subjects: subjects || []
                });
            } else if (role === 'teacher' && finalUniqueId) {
                await TeacherProfile.create({
                    user: user._id,
                    uniqueId: finalUniqueId,
                    phoneNumber: phoneNumber || "",
                    subjects: subjects || []
                });
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                uniqueId: finalUniqueId,
                password: finalPassword, // Sending back so admin can share it
                userType: user.userType,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all users (Students & Teachers, or also Admins if Super Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAdminUsers = async (req, res) => {
    try {
        let query = { role: { $nin: ['admin', 'superadmin'] } };
        
        // If user is superadmin, they can see regular admins too (but maybe not themselves/other superadmins depending on preference)
        if (req.user.role === 'superadmin') {
            query = { role: { $ne: 'superadmin' } };
        }

        const users = await User.find(query).select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create a new Classroom
// @route   POST /api/admin/classrooms
// @access  Private/Admin
export const createClassroom = async (req, res) => {
    try {
        const { name, className, board, subjects } = req.body;

        if (!name || !className || !board) {
            return res.status(400).json({ message: "Please provide all required fields (name, className, board)" });
        }

        const classroom = await Classroom.create({
            name,
            className,
            board,
            subjects: subjects || [],
            students: [],
            teachers: [],
        });

        res.status(201).json(classroom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all Classrooms
// @route   GET /api/admin/classrooms
// @access  Private/Admin
export const getAdminClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find()
            .populate('students', 'name email role')
            .populate('teachers', 'name email role');
        res.status(200).json(classrooms);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a Classroom
// @route   PATCH /api/admin/classrooms/:id
// @access  Private/Admin
export const updateClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, className, board, subjects } = req.body;

        const classroom = await Classroom.findById(id);

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        classroom.name = name || classroom.name;
        classroom.className = className || classroom.className;
        classroom.board = board || classroom.board;
        if (subjects) {
            classroom.subjects = Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim()).filter(s => s);
        }

        const updatedClassroom = await classroom.save();
        res.status(200).json(updatedClassroom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a Classroom
// @route   DELETE /api/admin/classrooms/:id
// @access  Private/Admin
export const deleteClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        const classroom = await Classroom.findById(id);

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        await Classroom.findByIdAndDelete(id);
        res.status(200).json({ message: "Classroom deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Assign users to a Classroom
// @route   POST /api/admin/classrooms/:id/assign
// @access  Private/Admin
export const assignUsersToClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        const { userIds, role } = req.body; // role specifies if we are adding logic for "student" or "teacher" arrays

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "Please provide an array of userIds" });
        }

        const classroom = await Classroom.findById(id);

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        if (role === 'student') {
            // Add unique student IDs
            const currentStudents = classroom.students.map(s => s.toString());
            userIds.forEach(uid => {
                if (!currentStudents.includes(uid)) {
                    classroom.students.push(uid);
                }
            });
        } else if (role === 'teacher') {
            // Add unique teacher IDs
            const currentTeachers = classroom.teachers.map(t => t.toString());
            userIds.forEach(uid => {
                if (!currentTeachers.includes(uid)) {
                    classroom.teachers.push(uid);
                }
            });
        } else {
            return res.status(400).json({ message: "Invalid role specified for assignment (must be 'student' or 'teacher')" });
        }

        await classroom.save();

        const updatedClassroom = await Classroom.findById(id)
            .populate('students', 'name email role')
            .populate('teachers', 'name email role');

        res.status(200).json(updatedClassroom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a user
// @route   PATCH /api/admin/users/:id
// @access  Private/Admin
export const updateAdminUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hierarchy Check: Admin cannot update other Admin or Super Admin
        if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
            return res.status(403).json({ message: "Admins cannot modify other admin accounts" });
        }

        // Email Validation
        if (req.body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(req.body.email)) {
                return res.status(400).json({ message: "Please provide a valid email address" });
            }
            // Check if email is already taken by another user
            const emailExists = await User.findOne({ email: req.body.email, _id: { $ne: req.params.id } });
            if (emailExists) {
                return res.status(400).json({ message: "Email is already in use by another user" });
            }
        }

        // Phone Number Validation - Exactly 10 digits
        if (req.body.phoneNumber) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(req.body.phoneNumber.replace(/\s+/g, ""))) {
                return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
            }
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.class = req.body.class || user.class;

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            uniqueId: updatedUser.uniqueId,
            phoneNumber: updatedUser.phoneNumber,
            class: updatedUser.class,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteAdminUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hierarchy Check: Admin cannot delete other Admin or Super Admin
        if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
            return res.status(403).json({ message: "Admins cannot delete other admin accounts" });
        }

        // Remove associated profiles
        if (user.role === 'student') {
            await StudentProfile.findOneAndDelete({ user: user._id });
        } else if (user.role === 'teacher') {
            await TeacherProfile.findOneAndDelete({ user: user._id });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Block/Unblock a user
// @route   PATCH /api/admin/users/:id/block
// @access  Private/Admin
export const blockAdminUser = async (req, res) => {
    try {
        const { isBlocked, reason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isBlocked = isBlocked;
        user.blockReason = isBlocked ? reason : "";

        await user.save();

        res.status(200).json({ 
            message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
            isBlocked: user.isBlocked,
            blockReason: user.blockReason
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// --- ANNOUNCEMENTS ---

// @desc    Create Announcement
// @route   POST /api/admin/announcements
export const createAnnouncement = async (req, res) => {
    try {
        const { title, content, targetType, targetId } = req.body;
        const announcement = await Announcement.create({
            title,
            content,
            targetType,
            targetId,
            author: req.user._id
        });
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Announcements
// @route   GET /api/admin/announcements
export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({}).populate('author', 'name').sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Announcement
// @route   DELETE /api/admin/announcements/:id
export const deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: "Announcement deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit Results (Moved to examController)

// --- BULK PROMOTIONS ---

// @desc    Promote Class
// @route   POST /api/admin/promote
export const promoteClass = async (req, res) => {
    try {
        const { classroomId, nextClass } = req.body;
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) return res.status(404).json({ message: "Classroom not found" });

        // Update all students in this classroom
        await User.updateMany(
            { _id: { $in: classroom.students } },
            { $set: { class: nextClass } }
        );

        // Update classroom level
        classroom.className = nextClass;
        await classroom.save();

        res.json({ message: `Class successfully promoted to ${nextClass}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- RESOURCE LIBRARY ---

// @desc    Add Study Material
// @route   POST /api/admin/resources
export const createResource = async (req, res) => {
    try {
        const { title, description, fileType, fileUrl, subject, board, classroom } = req.body;
        const resource = await StudyMaterial.create({
            title,
            description,
            fileType,
            fileUrl,
            subject,
            board,
            classroom,
            uploadedBy: req.user._id
        });
        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Resources
// @route   GET /api/admin/resources
export const getResources = async (req, res) => {
    try {
        const resources = await StudyMaterial.find({}).populate('classroom', 'name className').sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- AUDIT LOGS ---

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
export const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({}).populate('user', 'name role').sort({ createdAt: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
