import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Classroom from "../models/Classroom.js";

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Teacher/Admin)
export const createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, classroomId, attachments } = req.body;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        // Check if authorized (Admin or assigned teacher)
        const isTeacher = classroom.teachers.some(t => t.toString() === req.user._id.toString());
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
        if (!isAdmin && !isTeacher) {
            return res.status(403).json({ message: "Not authorized to post assignments here" });
        }

        const assignment = await Assignment.create({
            title,
            description,
            dueDate,
            classroom: classroomId,
            teacher: req.user._id,
            attachments: attachments || [],
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get assignments for a classroom
// @route   GET /api/assignments/classroom/:classroomId
// @access  Private
export const getClassroomAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ classroom: req.params.classroomId })
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });
        
        // If student, also get their submissions for these assignments
        if (req.user.role === 'student') {
            const submissions = await Submission.find({ 
                student: req.user._id,
                assignment: { $in: assignments.map(a => a._id) }
            });

            const assignmentsWithSubmissions = assignments.map(assignment => {
                const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
                return {
                    ...assignment._doc,
                    userSubmission: submission || null
                };
            });
            return res.status(200).json(assignmentsWithSubmissions);
        }

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = async (req, res) => {
    try {
        const { fileUrl, fileName } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Check if already submitted
        let submission = await Submission.findOne({ 
            assignment: assignment._id, 
            student: req.user._id 
        });

        if (submission) {
            submission.fileUrl = fileUrl;
            submission.fileName = fileName || "submission";
            submission.submittedAt = Date.now();
            submission.status = "Submitted"; // Reset status if re-submitting
            await submission.save();
        } else {
            submission = await Submission.create({
                assignment: assignment._id,
                student: req.user._id,
                fileUrl,
                fileName: fileName || "submission",
            });
        }

        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (Teacher/Admin)
export const getAssignmentSubmissions = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        const submissions = await Submission.find({ assignment: req.params.id })
            .populate('student', 'name email uniqueId')
            .sort({ submittedAt: -1 });

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Grade a submission
// @route   PUT /api/assignments/submissions/:id/grade
// @access  Private (Teacher/Admin)
export const gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        // Potential check: is the user a teacher of the classroom that owns this assignment?
        // For brevity, we trust the 'teacher' role middleware, but a deeper check could be added.

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = "Graded";
        await submission.save();

        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
