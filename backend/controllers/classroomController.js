import Classroom from "../models/Classroom.js";

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

        // Check if user is an admin or a teacher assigned to this classroom
        const isTeacher = classroom.teachers.some(t => t.toString() === req.user._id.toString());
        if (req.user.role !== 'admin' && !isTeacher) {
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
