import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import Result from "../models/Result.js";
import Classroom from "../models/Classroom.js";
import { sendExamScheduledEmail } from "../utils/emailService.js";
import Notification from "../models/Notification.js";

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private (Teacher/Admin)
export const createExam = async (req, res) => {
    const { title, description, duration, subject, classLevel, date, examCategory, examType, classroom } = req.body;

    try {
        const exam = await Exam.create({
            title,
            description,
            duration,
            subject,
            classLevel,
            date: examCategory === "practice" ? Date.now() : date,
            classroom,
            examCategory: examCategory || "scheduled",
            examType: examType || "subject-wise",
            teacher: req.user._id,
        });

        if (classroom) {
            const classroomData = await Classroom.findById(classroom).populate("students", "email name");
            if (classroomData && classroomData.students && classroomData.students.length > 0) {
                const studentEmails = classroomData.students.map(s => s.email);
                sendExamScheduledEmail(studentEmails, title, exam.date, classroomData.name);
            }

            // Send Application Notification
            await Notification.create({
                targetClassroom: classroom,
                title: "New Exam Scheduled",
                message: `${title} is now scheduled for your classroom.`,
                type: "exam"
            });
        }

        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all exams (optionally filtered by subject/class)
// @route   GET /api/exams
// @access  Private (All)
export const getExams = async (req, res) => {
    const { subject, classLevel, examType, classroomId } = req.query;
    try {
        let query = { isActive: true };
        
        // Students should only see published exams
        if (req.user.role === 'student') {
            query.status = 'published';
        }

        if (subject) query.subject = subject;
        if (classLevel) query.classLevel = classLevel;
        if (examType) query.examType = examType;
        if (classroomId) query.classroom = classroomId;

        // Apply global filters only if not querying a specific classroom
        if (!classroomId) {
            // Independent students (NEET/JEE/PSC): see subject-wise or mock exams for their classrooms
            if (req.user.role === 'student' && req.user.userType === 'independent') {
                // Merge both enrolledClassrooms and classrooms where student is in the students array
                const enrolledIds = (req.user.enrolledClassrooms || []).map(id => id.toString());
                const assignedClassrooms = await Classroom.find({ students: req.user._id });
                const assignedIds = assignedClassrooms.map(c => c._id.toString());
                const allClassroomIds = [...new Set([...enrolledIds, ...assignedIds])];
                
                query.classroom = { $in: allClassroomIds };
                
                // If explicit examType is requested, use it; otherwise show all relevant types
                if (examType) {
                    query.examType = examType;
                } else {
                    query.examType = { $in: ['subject-wise', 'mock', 'official'] };
                }
            }
            // Institutional students: filter by their enrolled classrooms
            else if (req.user.role === 'student' && req.user.userType === 'institutional') {
                const studentClassrooms = await Classroom.find({ students: req.user._id });
                const classroomIds = studentClassrooms.map(c => c._id);
                query.classroom = { $in: classroomIds };
            }
        }

        let exams = await Exam.find(query)
            .populate("teacher", "name")
            .populate("classroom", "name className board");

        if (req.user.role === 'student') {
            const submittedResults = await Result.find({ student: req.user._id }).select("exam");
            const submittedExamIds = new Set(submittedResults.map((result) => result.exam?.toString()).filter(Boolean));
            exams = exams.filter((exam) => !submittedExamIds.has(exam._id.toString()));
        }

        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk Create Exam with Questions
// @route   POST /api/exams/bulk
// @access  Private (Teacher/Admin)
export const createExamWithQuestions = async (req, res) => {
    const { title, description, duration, subject, classLevel, date, examCategory, examType, programType, classroom, questions, totalMarks, marksPerQuestion, negativeMarks, totalQuestions, status, sections } = req.body;

    const isDraft = status === 'draft';

    if (!title) {
        return res.status(400).json({ message: "Exam title is required even for drafts." });
    }

    if (!isDraft && (!duration || !subject || !classroom)) {
        return res.status(400).json({ message: "Please provide all required fields: duration, subject, and classroom." });
    }

    // Skip strict validation for drafts
    if (!isDraft) {
        // New validation for score consistency - handles optional questions/sections
        let qCountForScoring = parseInt(totalQuestions) || (questions ? questions.length : 0);
        
        // If sections exist, use the sum of attendQuestions for scoring
        if (sections && Array.isArray(sections) && sections.length > 0) {
            const sumAttend = sections.reduce((acc, s) => acc + (parseInt(s.attendQuestions) || 0), 0);
            if (sumAttend > 0) {
                qCountForScoring = sumAttend;
            }
        }

        const mPerQ = parseFloat(marksPerQuestion) || 0;
        const tMarks = parseFloat(totalMarks) || 0;

        if (mPerQ <= 0 || tMarks <= 0) {
            return res.status(400).json({ message: "Marks per question and Total marks must be greater than zero when publishing." });
        }

        if (qCountForScoring * mPerQ !== tMarks) {
            return res.status(400).json({ 
                message: `Score mismatch: ${qCountForScoring} questions to attend × ${mPerQ} marks/question = ${qCountForScoring * mPerQ}, but Total Marks is ${tMarks}.` 
            });
        }
        
        if (examCategory !== "practice" && !date) {
            return res.status(400).json({ message: "Date is required for scheduled exams." });
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "Add at least one question before publishing the exam." });
        }
    }

    const normalizedQuestions = questions.map((question) => ({
        ...question,
        questionText: question?.questionText?.trim(),
        options: Array.isArray(question?.options)
            ? question.options.map((option) => option?.trim?.() ?? option)
            : [],
        explanation: question?.explanation?.trim?.() || "",
        imageUrl: question?.imageUrl || undefined,
    }));

    if (!isDraft && questions && questions.length > 0) {
        const invalidQuestionIndex = normalizedQuestions.findIndex((question) => {
            const hasValidQuestionText = Boolean(question.questionText);
            const hasFourOptions = Array.isArray(question.options) && question.options.length === 4;
            const hasAllOptionsFilled = hasFourOptions && question.options.every((option) => Boolean(option));
            const hasValidCorrectAnswer =
                Number.isInteger(question.correctAnswer) &&
                question.correctAnswer >= 0 &&
                question.correctAnswer < question.options.length;

            return !hasValidQuestionText || !hasAllOptionsFilled || !hasValidCorrectAnswer;
        });

        if (invalidQuestionIndex !== -1) {
            return res.status(400).json({
                message: `Question ${invalidQuestionIndex + 1} is incomplete. Please fill the question text, all 4 options, and choose the correct answer.`,
            });
        }
    }

    try {
        // Create Exam
        const exam = await Exam.create({
            title,
            description,
            duration,
            subject,
            classLevel: classLevel || "10",
            date: examCategory === "practice" ? Date.now() : date,
            classroom,
            totalMarks: totalMarks || 100,
            examCategory: examCategory || "scheduled",
            examType: examType || "subject-wise",
            programType: programType || "PrimeOne",
            totalQuestions: parseInt(totalQuestions) || (Array.isArray(questions) ? questions.length : 0),
            marksPerQuestion: parseFloat(marksPerQuestion) || 0,
            negativeMarks: parseFloat(negativeMarks) || 0,
            teacher: req.user._id,
            status: status || "draft",
            sections: sections || [],
        });

        const questionsWithExamId = normalizedQuestions.map((question) => ({
            ...question,
            exam: exam._id,
            status: 'published',
            createdBy: req.user._id,
            sectionName: question.sectionName,
        }));
        await Question.insertMany(questionsWithExamId);

        if (classroom) {
            const classroomData = await Classroom.findById(classroom).populate("students", "email name");
            if (classroomData && classroomData.students && classroomData.students.length > 0) {
                const studentEmails = classroomData.students.map(s => s.email);
                sendExamScheduledEmail(studentEmails, title, exam.date, classroomData.name);
            }

            // Send Application Notification
            await Notification.create({
                targetClassroom: classroom,
                title: "New Exam Scheduled",
                message: `${title} is now scheduled for your classroom.`,
                type: "exam"
            });
        }

        res.status(201).json(exam);
    } catch (error) {
        console.error("Bulk Exam Creation Error:", error);
        res.status(error.name === 'ValidationError' ? 400 : 500).json({ 
            message: error.message || "Failed to create exam." 
        });
    }
};

// @desc    Add question to exam
// @route   POST /api/exams/:id/questions
// @access  Private (Teacher/Admin)
export const addQuestion = async (req, res) => {
    const { questionText, options, correctAnswer, explanation, status } = req.body;
    const examId = req.params.id;

    try {
        const exam = await Exam.findById(examId);

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        const question = await Question.create({
            exam: examId,
            questionText,
            options,
            correctAnswer,
            explanation,
            status: status === "published" ? "published" : "draft",
            createdBy: req.user._id,
        });

        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Delete a question (draft or published)
// @route   DELETE /api/exams/questions/:id
// @access  Private (Teacher/Admin)
export const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        if (question.createdBy.toString() !== req.user._id.toString() && !["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ message: "Not authorized to delete this question." });
        }

        await question.deleteOne();
        res.json({ message: "Question deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Save or update draft question
// @route   POST /api/exams/questions/draft
// @access  Private (Teacher/Admin)
export const saveDraftQuestion = async (req, res) => {
    const { exam, classroom, questionText, options, correctAnswer, explanation, imageUrl } = req.body;

    // Relaxed validation for drafts - allow saving even if incomplete
    if (!questionText && (!options || options.length === 0)) {
        return res.status(400).json({ message: "Provide at least a question text or options to save a draft." });
    }

    try {
        const question = await Question.create({
            exam: exam || null,
            classroom: classroom || null,
            questionText: questionText || "",
            options: Array.isArray(options) ? options : ["", "", "", ""],
            correctAnswer: correctAnswer !== undefined ? correctAnswer : 0,
            explanation: explanation || "",
            imageUrl: imageUrl || "",
            status: "draft",
            createdBy: req.user._id,
        });

        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get draft questions for current user
// @route   GET /api/exams/questions/drafts
// @access  Private (Teacher/Admin)
export const getDraftQuestions = async (req, res) => {
    const { exam, classroom } = req.query;

    try {
        const query = {
            createdBy: req.user._id,
            status: "draft",
        };

        if (exam) query.exam = exam;
        if (classroom) query.classroom = classroom;

        const questions = await Question.find(query);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a question (draft or published)
// @route   PUT /api/exams/questions/:id
// @access  Private (Teacher/Admin)
export const updateQuestion = async (req, res) => {
    const questionId = req.params.id;
    const { questionText, options, correctAnswer, explanation, status, classroom, exam } = req.body;

    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        if (question.createdBy.toString() !== req.user._id.toString() && !["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ message: "Not authorized to edit this question." });
        }

        question.questionText = questionText || question.questionText;
        question.options = options || question.options;
        question.correctAnswer = correctAnswer !== undefined ? correctAnswer : question.correctAnswer;
        question.explanation = explanation || question.explanation;
        question.status = status === "published" ? "published" : status === "draft" ? "draft" : question.status;
        question.classroom = classroom || question.classroom;
        question.exam = exam || question.exam;

        await question.save();

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Publish a draft question
// @route   POST /api/exams/questions/:id/publish
// @access  Private (Teacher/Admin)
export const publishQuestion = async (req, res) => {
    const questionId = req.params.id;

    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        if (question.createdBy.toString() !== req.user._id.toString() && !["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ message: "Not authorized to publish this question." });
        }

        question.status = "published";
        await question.save();

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get questions for an exam
// @route   GET /api/exams/:id/questions
// @access  Private (All)
export const getExamQuestions = async (req, res) => {
    try {
        const isAdminOrTeacher = req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.role === 'teacher';
        const includeDrafts = req.query.includeDrafts === 'true' || isAdminOrTeacher;
        const query = { exam: req.params.id };

        if (!includeDrafts) {
            query.status = 'published';
        }

        const questions = await Question.find(query);

        // Security: If student, check if they have submitted or if exam is over
        if (req.user.role === 'student') {
            const hasSubmitted = await Result.findOne({ exam: req.params.id, student: req.user._id });
            if (!hasSubmitted) {
                // Return questions without correct answers and explanations
                const strippedQuestions = questions.map(q => ({
                    _id: q._id,
                    exam: q.exam,
                    questionText: q.questionText,
                    options: q.options
                }));
                return res.json(strippedQuestions);
            }
        }

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit exam and calculate score
// @route   POST /api/exams/:id/submit
// @access  Private (Student)
export const submitExam = async (req, res) => {
    const { answers, timeTaken } = req.body;
    const examId = req.params.id;

    try {
        const existingResult = await Result.findOne({ exam: examId, student: req.user._id });
        if (existingResult) {
            return res.status(400).json({ message: "You have already submitted this exam." });
        }

        const exam = await Exam.findById(examId);
        const questions = await Question.find({ exam: examId });

        if (!exam || !questions) {
            return res.status(404).json({ message: "Exam or questions not found" });
        }

        const marksPerQ = exam.marksPerQuestion ?? 1;
        const negMarks  = exam.negativeMarks   ?? 0;

        let score = 0;
        const processedAnswers = answers.map((ans) => {
            const question = questions.find((q) => q._id.toString() === ans.questionId);
            const isCorrect = question && question.correctAnswer === ans.selectedOption;
            const isAttempted = ans.selectedOption !== null && ans.selectedOption !== undefined;

            if (isCorrect) {
                score += marksPerQ;
            } else if (isAttempted) {
                score -= negMarks; // subtract negative marks only if answered wrongly
            }

            return {
                questionId: ans.questionId,
                selectedOption: ans.selectedOption,
                isCorrect,
            };
        });

        score = Math.max(0, parseFloat(score.toFixed(2))); // floor at 0, round to 2 decimal places

        const result = await Result.create({
            student: req.user._id,
            exam: examId,
            score,
            answers: processedAnswers,
            timeTaken,
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Private (Teacher/Admin)
export const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        // Check ownership
        if (exam.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized to delete this exam" });
        }

        await Exam.findByIdAndDelete(req.params.id);
        // Also delete associated questions
        await Question.deleteMany({ exam: req.params.id });

        res.json({ message: "Exam and associated questions deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Teacher/Admin)
export const updateExam = async (req, res) => {
    try {
        const { title, subject, duration, totalMarks, questions, date, classroom, examCategory, examType, programType, totalQuestions, marksPerQuestion, negativeMarks, status, sections } = req.body;
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        // Check ownership
        if (exam.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized to update this exam" });
        }

        const isDraft = (status || exam.status) === 'draft';

        // Score consistency validation for updates (skip for drafts)
        if (!isDraft) {
            let qCountForScoring = parseInt(totalQuestions || exam.totalQuestions || (questions ? questions.length : 0));
            
            // If sections exist in update or existing exam, use the sum of attendQuestions
            const currentSections = sections || exam.sections;
            if (currentSections && Array.isArray(currentSections) && currentSections.length > 0) {
                const sumAttend = currentSections.reduce((acc, s) => acc + (parseInt(s.attendQuestions) || 0), 0);
                if (sumAttend > 0) {
                    qCountForScoring = sumAttend;
                }
            }

            const mPerQ = parseFloat(marksPerQuestion !== undefined ? marksPerQuestion : exam.marksPerQuestion);
            const tMarks = parseFloat(totalMarks || exam.totalMarks);

            if (qCountForScoring * mPerQ !== tMarks) {
                return res.status(400).json({ 
                    message: `Score mismatch: ${qCountForScoring} questions to attend × ${mPerQ} marks/question = ${qCountForScoring * mPerQ}, but Total Marks is ${tMarks}.` 
                });
            }
        }

        exam.title = title || exam.title;
        exam.subject = subject || exam.subject;        exam.duration = duration !== undefined ? (parseInt(duration) || 0) : exam.duration;
        exam.totalMarks = totalMarks !== undefined ? (parseFloat(totalMarks) || 0) : exam.totalMarks;
        exam.date = date || exam.date;
        exam.classroom = classroom || exam.classroom;
        exam.examCategory = examCategory || exam.examCategory;
        exam.examType = examType || exam.examType;
        exam.programType = programType || exam.programType;
        exam.totalQuestions = totalQuestions !== undefined ? (parseInt(totalQuestions) || 0) : exam.totalQuestions;
        exam.marksPerQuestion = marksPerQuestion !== undefined ? (parseFloat(marksPerQuestion) || 0) : exam.marksPerQuestion;
        exam.negativeMarks = negativeMarks !== undefined ? (parseFloat(negativeMarks) || 0) : exam.negativeMarks;
        exam.status = status || exam.status;
        exam.sections = sections || exam.sections;


        const updatedExam = await exam.save();

        // If questions are provided, replace existing questions
        if (questions && questions.length > 0) {
            await Question.deleteMany({ exam: req.params.id });
            const questionsWithExam = questions.map((q) => ({
                ...q,
                exam: updatedExam._id,
                sectionName: q.sectionName,
            }));
            await Question.insertMany(questionsWithExam);
        }

        res.json(updatedExam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single exam details with questions
// @route   GET /api/exams/:id
// @access  Private (All)
export const getExamDetails = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate("teacher", "name")
            .populate("classroom", "name students");
            
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        
        const questions = await Question.find({ exam: req.params.id });
        
        // Find results and sort by marksObtained descending to help with ranking
        const results = await Result.find({ exam: req.params.id })
            .populate("student", "name email")
            .sort({ marksObtained: -1, score: -1 });

        // Calculate metadata
        const totalStudents = exam.classroom?.students?.length || 0;
        const attendedCount = results.length;

        res.json({ 
            ...exam._doc, 
            questions, 
            results,
            stats: {
                totalStudents,
                attendedCount,
                attendanceRate: totalStudents > 0 ? (attendedCount / totalStudents) * 100 : 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get current student's results
// @route   GET /api/exams/my-results
// @access  Private (Student)
export const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.user._id })
            .populate("exam", "title subject duration date")
            .sort("-createdAt");
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit Results (Manual/Admin)
// @route   POST /api/admin/results
// @access  Private (Admin)
export const submitResults = async (req, res) => {
    try {
        const { examId, studentId, marksObtained, remarks } = req.body;
        const result = await Result.findOneAndUpdate(
            { exam: examId, student: studentId },
            { marksObtained, remarks },
            { upsert: true, new: true }
        );
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
