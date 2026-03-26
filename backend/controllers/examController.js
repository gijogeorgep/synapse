import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import Result from "../models/Result.js";
import Classroom from "../models/Classroom.js";
import { sendExamScheduledEmail } from "../utils/emailService.js";

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
            // Institutional students: filter by their class level AND their enrolled classrooms
            else if (req.user.role === 'student' && req.user.userType === 'institutional') {
                const studentClassrooms = await Classroom.find({ students: req.user._id });
                const classroomIds = studentClassrooms.map(c => c._id);
                const classLevels = studentClassrooms.map(c => c.className);
                if (!classLevel) query.classLevel = { $in: classLevels };
            }
        }

        const exams = await Exam.find(query).populate("teacher", "name");
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk Create Exam with Questions
// @route   POST /api/exams/bulk
// @access  Private (Teacher/Admin)
export const createExamWithQuestions = async (req, res) => {
    const { title, description, duration, subject, classLevel, date, examCategory, examType, classroom, questions, totalMarks, marksPerQuestion, negativeMarks } = req.body;

    if (!title || !duration || !subject || !classroom) {
        return res.status(400).json({ message: "Please provide all required fields: title, duration, subject, and classroom." });
    }
    
    if (examCategory !== "practice" && !date) {
        return res.status(400).json({ message: "Date is required for scheduled exams." });
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
            marksPerQuestion: marksPerQuestion ?? 1,
            negativeMarks: negativeMarks ?? 0,
            teacher: req.user._id,
        });

        // Create Questions
        if (questions && questions.length > 0) {
            // Basic validation for questions
            const invalidQuestion = questions.find(q => !q.questionText || !q.options || q.options.length < 2);
            if (invalidQuestion) {
                // If questions are invalid, we might want to delete the exam we just created
                // or just return an error. For simplicity, we'll return an error.
                // Note: In production, consider using transactions.
                await Exam.findByIdAndDelete(exam._id);
                return res.status(400).json({ message: "Each question must have text and at least 2 options." });
            }

            const questionsWithExamId = questions.map((q) => ({
                ...q,
                exam: exam._id,
            }));
            await Question.insertMany(questionsWithExamId);
        }

        if (classroom) {
            const classroomData = await Classroom.findById(classroom).populate("students", "email name");
            if (classroomData && classroomData.students && classroomData.students.length > 0) {
                const studentEmails = classroomData.students.map(s => s.email);
                sendExamScheduledEmail(studentEmails, title, exam.date, classroomData.name);
            }
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
    const { questionText, options, correctAnswer, explanation } = req.body;
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
        });

        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get questions for an exam
// @route   GET /api/exams/:id/questions
// @access  Private (All)
export const getExamQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ exam: req.params.id });
        
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
        const { title, subject, duration, totalMarks, questions, date, classroom, examCategory, examType } = req.body;
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        // Check ownership
        if (exam.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized to update this exam" });
        }

        exam.title = title || exam.title;
        exam.subject = subject || exam.subject;
        exam.duration = duration || exam.duration;
        exam.totalMarks = totalMarks || exam.totalMarks;
        exam.date = date || exam.date;
        exam.classroom = classroom || exam.classroom;
        exam.examCategory = examCategory || exam.examCategory;
        exam.examType = examType || exam.examType;

        const updatedExam = await exam.save();

        // If questions are provided, replace existing questions
        if (questions && questions.length > 0) {
            await Question.deleteMany({ exam: req.params.id });
            const questionsWithExam = questions.map((q) => ({
                ...q,
                exam: updatedExam._id,
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
