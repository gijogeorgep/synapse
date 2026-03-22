import Classroom from "../models/Classroom.js";
import { generateUniqueId } from "../utils/idGenerator.js";
import User from "../models/User.js";

// @desc    Get user's allocated classrooms
// @route   GET /api/classrooms/my-classrooms
// @access  Private
export const getMyClassrooms = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        let classrooms;

        if (role === 'student') {
            classrooms = await Classroom.find({ students: userId })
                .populate('teachers', 'name email avatarUrl')
                .populate('students', 'name email');
        } else if (role === 'teacher') {
            classrooms = await Classroom.find({ teachers: userId })
                .populate('teachers', 'name email avatarUrl')
                .populate('students', 'name email avatarUrl');
        } else if (role === 'admin') {
            // Admin can see all classrooms
            classrooms = await Classroom.find()
                .populate('teachers', 'name email')
                .populate('students', 'name email');
        } else {
            return res.status(403).json({ message: "Role not authorized for this operation" });
        }

        res.status(200).json(classrooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update classroom resources (link, notes)
// @route   PUT /api/classrooms/:id/resources
// @access  Private (Teacher/Admin)
export const updateClassroomResources = async (req, res) => {
    try {
        const { onlineClassLink, lectureNote } = req.body;
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        // Check if user is an admin/superadmin or a teacher assigned to this classroom
        const isTeacher = classroom.teachers.some(t => t.toString() === req.user._id.toString());
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
        if (!isAdmin && !isTeacher) {
            return res.status(403).json({ message: "Not authorized to update this classroom" });
        }

        if (onlineClassLink !== undefined) {
            classroom.onlineClassLink = onlineClassLink;
        }

        if (lectureNote) {
            classroom.lectureNotes.push(lectureNote);
        }

        await classroom.save();
        res.status(200).json(classroom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get public classrooms (NEET, JEE, PSC)
// @route   GET /api/classrooms/public
// @access  Public
export const getPublicClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find({ type: { $in: ["NEET", "JEE", "PSC"] } })
            .select("name type price className board");
        res.status(200).json(classrooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Enroll in a classroom (Mock payment)
// @route   POST /api/classrooms/:id/enroll
// @access  Private (Student)

export const enrollInClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already enrolled
        if (classroom.students.includes(user._id)) {
            return res.status(400).json({ message: "Already enrolled in this classroom" });
        }

        // Add user to classroom
        classroom.students.push(user._id);
        await classroom.save();

        // Add classroom to user's enrolled list
        user.enrolledClassrooms.push(classroom._id);

        // Generate Unique ID if user doesn't have one or if it's the first classroom
        // The user ID format depends on the classroom type (N, J, P)
        // If they enroll in multiple, maybe they keep the first ID? 
        // Or the user wants "this type of student also have Id... it will be like SSEHX1001"
        // Let's assume one main classroom ID or generate based on the one they just enrolled in.
        if (!user.uniqueId) {
            user.uniqueId = await generateUniqueId('student', classroom.type);
        }

        await user.save();

        res.status(200).json({
            message: "Enrolled successfully",
            classroom: classroom.name,
            uniqueId: user.uniqueId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

