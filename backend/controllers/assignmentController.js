import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Classroom from "../models/Classroom.js";

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Teacher/Admin)
export const createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, classroomId, attachments, maxPoints } = req.body;
        const parsedMaxPoints = Number(maxPoints);

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
            maxPoints: Number.isFinite(parsedMaxPoints) && parsedMaxPoints > 0 ? parsedMaxPoints : 100,
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
        const { score, feedback } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        const assignment = await Assignment.findById(submission.assignment);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Potential check: is the user a teacher of the classroom that owns this assignment?
        // For brevity, we trust the 'teacher' role middleware, but a deeper check could be added.

        const parsedScore = Number(score);
        const normalizedScore = Number.isFinite(parsedScore)
            ? Math.max(0, Math.min(parsedScore, assignment.maxPoints || 100))
            : 0;

        submission.score = normalizedScore;
        submission.grade = `${normalizedScore}/${assignment.maxPoints || 100}`;
        submission.feedback = feedback;
        submission.status = "Graded";
        await submission.save();

        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    View a submitted assignment file inline
// @route   GET /api/assignments/submissions/:id/view
// @access  Private
export const viewSubmissionFile = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id).populate(
            "assignment",
            "classroom teacher title"
        );

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        const assignment = submission.assignment;
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        const isOwner = submission.student.toString() === req.user._id.toString();
        const isAdmin = ["admin", "superadmin"].includes(req.user.role);
        const isTeacher = req.user.role === "teacher";

        if (!isOwner && !isAdmin && !isTeacher) {
            return res.status(403).json({ message: "Not authorized to view this submission" });
        }

        if (isTeacher && !isAdmin) {
            const classroom = await Classroom.findById(assignment.classroom).select("teachers");
            const teacherIds = Array.isArray(classroom?.teachers) ? classroom.teachers.map((t) => t.toString()) : [];
            if (!teacherIds.includes(req.user._id.toString())) {
                return res.status(403).json({ message: "Not authorized to view this submission" });
            }
        }

        const sourceUrl = submission.fileUrl;
        if (!sourceUrl) {
            return res.status(404).json({ message: "Submission file not found" });
        }

        const upstream = await fetch(sourceUrl);
        if (!upstream.ok) {
            const text = await upstream.text();
            throw new Error(`Failed to fetch submission file: ${upstream.status} ${text}`);
        }

        const fileName = submission.fileName || "submission.pdf";
        const isPdf =
            fileName.toLowerCase().endsWith(".pdf") ||
            (submission.fileUrl || "").toLowerCase().includes(".pdf");

        // Homework submissions are uploaded as PDFs, so force inline PDF rendering.
        // This prevents browsers from treating the blob as a downloadable binary.
        const contentType = isPdf ? "application/pdf" : (upstream.headers.get("content-type") || "application/pdf");
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
        res.setHeader("X-Content-Type-Options", "nosniff");

        const arrayBuffer = await upstream.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error("Error viewing submission file:", error);
        res.status(500).json({
            message: "Error viewing submission file",
            details: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher/Admin)
export const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        const classroom = await Classroom.findById(assignment.classroom);
        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        const isTeacher = classroom.teachers.some(t => t.toString() === req.user._id.toString());
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
        if (!isAdmin && !isTeacher) {
            return res.status(403).json({ message: "Not authorized to delete assignments here" });
        }

        await Submission.deleteMany({ assignment: assignment._id });
        await Assignment.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Assignment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
