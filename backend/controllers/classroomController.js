import Classroom from "../models/Classroom.js";
import { generateUniqueId } from "../utils/idGenerator.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

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
                .populate('students', 'name email avatarUrl uniqueId');
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

// @desc    Delete classroom resource (lecture note)
// @route   DELETE /api/classrooms/:id/resources/:noteId
// @access  Private (Teacher/Admin)
export const deleteClassroomResource = async (req, res) => {
    try {
        const { noteId } = req.params;
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

        classroom.lectureNotes = classroom.lectureNotes.filter(note => note._id.toString() !== noteId);
        
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
        const classrooms = await Classroom.find({ 
            isPublished: true 
        }).select("name type programType price className board showOnHome description imageUrl subjects");
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

        // Phone Number Validation - Must be 10 digits to enroll
        const phoneRegex = /^\d{10}$/;
        if (!user.phoneNumber || !phoneRegex.test(user.phoneNumber.replace(/\s+/g, ""))) {
            return res.status(400).json({ message: "A valid 10-digit phone number is required to enroll. Please update your profile in settings." });
        }

        // Add user to classroom
        classroom.students.push(user._id);
        await classroom.save();

        // Add classroom to user's enrolled list
        user.enrolledClassrooms.push(classroom._id);

        // Generate Unique ID if user doesn't have one or if it's a default General ID (SSG)
        // and they are enrolling in a specific program classroom.
        // For E-Zone: use className (NEET/JEE/PSC) since that's where exam type is now stored.
        const programName = classroom.programType === 'E-Zone'
            ? classroom.className   // NEET, JEE, or PSC
            : classroom.className;  // Class 10, 11, etc. (falls back to 'G' prefix)

        const isGeneralId = user.uniqueId && user.uniqueId.startsWith("SSG");
        const isSpecificProgram = ["NEET", "JEE", "PSC"].includes(classroom.className);

        if (!user.uniqueId || (isGeneralId && isSpecificProgram)) {
            user.uniqueId = await generateUniqueId('student', programName);
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

// @desc    View classroom resource (lecture note) via proxy
// @route   GET /api/classrooms/:id/resources/:noteId/view
// @access  Private (Student/Teacher/Admin)
export const viewClassroomResourceProxy = async (req, res) => {
    const { id, noteId } = req.params;
    console.log(`[VIEW_RESOURCE_PROXY] Request received for classroom ${id}, note ${noteId}`);

    try {
        const classroom = await Classroom.findById(id);
        if (!classroom) return res.status(404).json({ message: "Classroom not found" });

        const note = classroom.lectureNotes.id(noteId);
        if (!note) return res.status(404).json({ message: "Lecture note not found" });

        if (!note.url) return res.status(404).json({ message: "No URL found" });

        // Access check: Student must be in the classroom, or user is teacher/admin
        const isStudent = classroom.students.some(s => s.toString() === req.user._id.toString());
        const isTeacher = classroom.teachers.some(t => t.toString() === req.user._id.toString());
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

        if (!isStudent && !isTeacher && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to view this resource" });
        }

        let publicId = null;
        if (note.url) {
            const parts = note.url.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex !== -1) {
                // public_id is everything after the version (v12345...)
                publicId = parts.slice(uploadIndex + 2).join('/').split('.')[0];
            }
        }

        const secureUrl = cloudinary.url(publicId || note.url, {
            resource_type: 'raw',
            sign_url: true,
            secure: true
        });

        console.log(`[VIEW_RESOURCE_PROXY] Fetching: ${secureUrl}`);

        const response = await fetch(secureUrl);
        if (!response.ok) {
            throw new Error(`Cloudinary responded with ${response.status}`);
        }

        // We assume lecture notes uploaded to 'raw' are typically PDFs
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error("[VIEW_RESOURCE_PROXY] Error:", error);
        res.status(500).json({ message: "Error viewing document" });
    }
};

