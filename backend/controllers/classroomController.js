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
                .populate('students', 'name email avatarUrl');
        } else if (role === 'teacher') {
            classrooms = await Classroom.find({ teachers: userId })
                .populate('teachers', 'name email avatarUrl')
                .populate('students', 'name email avatarUrl uniqueId');
        } else if (role === 'admin' || role === 'superadmin') {
            // Admin/Superadmin can see all classrooms
            classrooms = await Classroom.find()
                .populate('teachers', 'name email avatarUrl')
                .populate('students', 'name email avatarUrl');
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
        const { onlineClassLink, classLinks, lectureNote } = req.body;
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
            // Only admin/superadmin can update the onlineClassLink
            if (isAdmin) {
                classroom.onlineClassLink = onlineClassLink;
            } else {
                return res.status(403).json({ message: "Only admins can update the live class link." });
            }
        }

        if (classLinks !== undefined) {
            classroom.classLinks = classLinks;
        }

        if (lectureNote) {
            // Support adding subject to lecture note
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
        if (!note || !note.url) return res.status(404).json({ message: "Lecture note not found" });

        const url = note.url.replace("http://", "https://");
        console.log(`[VIEW_RESOURCE_PROXY] Proxying: ${url}`);

        // Detect extension from suffix or URL
        const urlForExt = (req.params.filename || url || "").split('?')[0];
        const urlExt = urlForExt.split('.').pop().toLowerCase();

        const mimeTypes = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };

        const isPdf = urlExt === 'pdf' || url.toLowerCase().includes('.pdf') || (note.title || "").toLowerCase().includes('pdf');
        let contentType = mimeTypes[urlExt] || (isPdf ? 'application/pdf' : 'image/jpeg');

        // Fetch from Cloudinary
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Cloudinary responded with ${response.status}`);
        }

        const originalContentType = response.headers.get('content-type');
        if (originalContentType && originalContentType !== 'application/octet-stream' && originalContentType !== 'binary/octet-stream') {
            contentType = originalContentType;
        }

        const arrayBuffer = await response.arrayBuffer();

        // Set headers for inline preview
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="preview.${urlExt || (isPdf ? 'pdf' : 'jpg')}"`);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error("[VIEW_RESOURCE_PROXY] Error:", error.message);
        res.status(500).json({ message: "Error viewing document" });
    }
};
