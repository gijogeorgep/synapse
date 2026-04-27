import Classroom from "../models/Classroom.js";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import StudyMaterial from "../models/StudyMaterial.js";
import { Payment } from "../models/Financial.js";

// @desc    Get overall stats for the reports dashboard
// @route   GET /api/reports/overall
// @access  Private (Admin/SuperAdmin)
export const getOverallStats = async (req, res) => {
    try {
        const isSuperAdmin = req.user.role === 'superadmin';
        // Classrooms are scoped by creator for admins; users are global (consistent with User Management page)
        const classroomOwnershipQuery = isSuperAdmin ? {} : { createdBy: req.user._id };

        const [classrooms, students, teachers, admins, exams] = await Promise.all([
            Classroom.find(classroomOwnershipQuery),
            User.find({ role: 'student' }),
            User.find({ role: 'teacher' }),
            User.find({ role: 'admin' }),
            Exam.find(isSuperAdmin ? {} : { classroom: { $in: await Classroom.find(classroomOwnershipQuery).select('_id') } }),
        ]);

        const combinedRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalResults = await Result.find({ exam: { $in: exams.map(e => e._id) } });
        
        const avgScore = totalResults.length > 0 
            ? totalResults.reduce((acc, r) => acc + (r.marksObtained || 0), 0) / totalResults.length 
            : 0;

        // 1. Revenue Trends (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const revenueTrends = await Payment.aggregate([
            { $match: { 
                status: 'completed', 
                createdAt: { $gte: sixMonthsAgo },
                ...(isSuperAdmin ? {} : { student: { $in: students.map(s => s._id) } })
            }},
            { $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                amount: { $sum: "$amount" }
            }},
            { $sort: { "_id": 1 } }
        ]);

        // 2. User Growth (Last 6 Months)
        const userGrowth = await User.aggregate([
            { $match: { 
                createdAt: { $gte: sixMonthsAgo },
                role: { $in: ['student', 'teacher'] }
            }},
            { $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                students: { $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] } },
                teachers: { $sum: { $cond: [{ $eq: ["$role", "teacher"] }, 1, 0] } }
            }},
            { $sort: { "_id": 1 } }
        ]);

        // 3. Board Distribution
        const boardDistribution = await Classroom.aggregate([
            { $match: classroomOwnershipQuery },
            { $group: {
                _id: "$board",
                count: { $sum: 1 }
            }},
            { $project: { name: "$_id", value: "$count", _id: 0 } }
        ]);

        // 4. Assignment Engagement
        const totalAssignments = await Assignment.countDocuments(isSuperAdmin ? {} : { createdBy: req.user._id });
        const totalSubmissions = await Submission.countDocuments(isSuperAdmin ? {} : { 
            assignment: { $in: await Assignment.find({ createdBy: req.user._id }).select('_id') } 
        });

        // 5. Classroom Benchmarking
        const classroomComparison = await Promise.all(classrooms.map(async (cls) => {
            const clsExams = await Exam.find({ classroom: cls._id });
            const clsResults = await Result.find({ exam: { $in: clsExams.map(e => e._id) } });
            const clsAvg = clsResults.length > 0 
                ? clsResults.reduce((acc, r) => acc + (r.marksObtained || 0), 0) / clsResults.length 
                : 0;
            return { name: cls.name, average: Math.round(clsAvg) };
        }));

        // 6. Subject Mastery (Aggregated)
        const subjectMastery = await Result.aggregate([
            { $match: { exam: { $in: exams.map(e => e._id) } } },
            { $lookup: { from: 'exams', localField: 'exam', foreignField: '_id', as: 'examInfo' } },
            { $unwind: '$examInfo' },
            { $group: {
                _id: '$examInfo.subject',
                average: { $avg: '$marksObtained' }
            }},
            { $project: { subject: '$_id', average: { $round: ['$average', 0] }, _id: 0 } }
        ]);

        // 7. Engagement Funnel
        const activeStudents = await Result.distinct('student', { exam: { $in: exams.map(e => e._id) } });
        const passedStudents = await Result.aggregate([
            { $match: { exam: { $in: exams.map(e => e._id) } } },
            { $group: { _id: '$student', avg: { $avg: '$marksObtained' } } },
            { $match: { avg: { $gte: 40 } } }
        ]);

        res.json({
            totalClassrooms: classrooms.length,
            totalStudents: students.length,
            totalTeachers: teachers.length,
            totalAdmins: admins.length,
            totalExams: exams.length,
            totalRevenue: combinedRevenue[0]?.total || 0,
            avgPerformance: Math.round(avgScore),
            revenueTrends: revenueTrends.map(r => ({ month: r._id, amount: r.amount })),
            userGrowth: userGrowth.map(u => ({ month: u._id, students: u.students, teachers: u.teachers })),
            boardDistribution,
            assignmentStats: {
                total: totalAssignments,
                submissions: totalSubmissions
            },
            classroomComparison: classroomComparison.sort((a,b) => b.average - a.average).slice(0, 5),
            subjectMastery,
            engagementFunnel: [
                { name: 'Enrolled', value: students.length },
                { name: 'Active', value: activeStudents.length },
                { name: 'Passing', value: passedStudents.length }
            ]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get classroom-wise performance reports
// @route   GET /api/reports/classrooms
// @access  Private (Admin/SuperAdmin)
export const getClassroomReports = async (req, res) => {
    try {
        const isSuperAdmin = req.user.role === 'superadmin';
        const classroomOwnershipQuery = isSuperAdmin ? {} : { createdBy: req.user._id };

        const classrooms = await Classroom.find(classroomOwnershipQuery)
            .populate('students', 'name')
            .populate('teachers', 'name');

        const reports = await Promise.all(classrooms.map(async (cls) => {
            const exams = await Exam.find({ classroom: cls._id });
            const results = await Result.find({ exam: { $in: exams.map(e => e._id) } });
            
            const avgScore = results.length > 0 
                ? results.reduce((acc, r) => acc + (r.marksObtained || 0), 0) / results.length 
                : 0;

            return {
                _id: cls._id,
                name: cls.name,
                className: cls.className,
                studentCount: cls.students.length,
                teacherCount: cls.teachers.length,
                examCount: exams.length,
                avgScore: Math.round(avgScore),
                performanceLevel: avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Average'
            };
        }));

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get individual student deep-dive report
// @route   GET /api/reports/student/:id
// @access  Private (Admin/SuperAdmin)
export const getStudentDeepDive = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId).select('-password');
        
        if (!student) return res.status(404).json({ message: "Student not found" });

        const results = await Result.find({ student: studentId })
            .populate('exam', 'title subject totalMarks date')
            .sort({ createdAt: 1 });

        const performanceHistory = results.map(r => ({
            date: r.exam.date,
            examTitle: r.exam.title,
            score: r.marksObtained,
            total: r.exam.totalMarks,
            percentage: Math.round((r.marksObtained / r.exam.totalMarks) * 100)
        }));

        const subjectStats = {};
        results.forEach(r => {
            if (!subjectStats[r.exam.subject]) {
                subjectStats[r.exam.subject] = { total: 0, count: 0 };
            }
            subjectStats[r.exam.subject].total += (r.marksObtained / r.exam.totalMarks) * 100;
            subjectStats[r.exam.subject].count += 1;
        });

        const subjectPerformance = Object.keys(subjectStats).map(sub => ({
            subject: sub,
            average: Math.round(subjectStats[sub].total / subjectStats[sub].count)
        }));

        res.json({
            student,
            performanceHistory,
            subjectPerformance,
            overallAverage: Math.round(performanceHistory.reduce((acc, h) => acc + h.percentage, 0) / (performanceHistory.length || 1)),
            examsTaken: performanceHistory.length,
            improvementIndex: performanceHistory.length > 1 
                ? performanceHistory[performanceHistory.length - 1].percentage - performanceHistory[0].percentage
                : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get performance breakdown by subject across all classrooms
// @route   GET /api/reports/subjects
export const getSubjectMastery = async (req, res) => {
    try {
        const isSuperAdmin = req.user.role === 'superadmin';
        const classroomOwnershipQuery = isSuperAdmin ? {} : { createdBy: req.user._id };

        const classrooms = await Classroom.find(classroomOwnershipQuery).select('_id');
        const exams = await Exam.find({ classroom: { $in: classrooms.map(c => c._id) } });
        const results = await Result.find({ exam: { $in: exams.map(e => e._id) } }).populate('exam', 'subject totalMarks');

        const mastery = {};
        results.forEach(r => {
            if (!r.exam || !r.exam.subject) return;
            if (!mastery[r.exam.subject]) mastery[r.exam.subject] = { total: 0, count: 0 };
            mastery[r.exam.subject].total += (r.marksObtained / r.exam.totalMarks) * 100;
            mastery[r.exam.subject].count += 1;
        });

        const reports = Object.keys(mastery).map(sub => ({
            subject: sub,
            average: Math.round(mastery[sub].total / mastery[sub].count)
        })).sort((a, b) => b.average - a.average);

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students for selection list
// @route   GET /api/reports/students-list
export const getStudentsList = async (req, res) => {
    try {
        // All admins can see all students (consistent with User Management page)
        const students = await User.find({ role: 'student' })
            .select('name uniqueId email enrolledClassrooms')
            .populate('enrolledClassrooms', 'name');

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all teachers for selection list
// @route   GET /api/reports/teachers-list
export const getTeachersList = async (req, res) => {
    try {
        // All admins can see all teachers (consistent with User Management page)
        const teachers = await User.find({ role: 'teacher' })
            .select('name uniqueId email')
            .lean();

        const teachersWithStats = await Promise.all(teachers.map(async (t) => {
            const classrooms = await Classroom.find({ teachers: t._id });
            return {
                ...t,
                classroomCount: classrooms.length,
                studentCount: classrooms.reduce((acc, c) => acc + c.students.length, 0)
            };
        }));

        res.json(teachersWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get teacher-specific performance stats
// @route   GET /api/reports/teacher/:id
export const getTeacherStats = async (req, res) => {
    try {
        const teacherId = req.params.id;

        const teacher = await User.findOne({ _id: teacherId, role: 'teacher' }).select('-password');
        if (!teacher) return res.status(404).json({ message: "Teacher not found or access denied" });

        const classrooms = await Classroom.find({ teachers: teacherId });
        const classroomIds = classrooms.map(c => c._id);
        
        const exams = await Exam.find({ classroom: { $in: classroomIds } });
        const examIds = exams.map(e => e._id);
        
        const results = await Result.find({ exam: { $in: examIds } });
        
        const avgScore = results.length > 0 
            ? results.reduce((acc, r) => acc + (r.marksObtained / (r.totalMarks || 100)) * 100, 0) / results.length 
            : 0;

        res.json({
            teacher,
            classrooms: classrooms.map(c => ({ name: c.name, studentCount: c.students.length })),
            totalExams: exams.length,
            totalStudents: classrooms.reduce((acc, c) => acc + c.students.length, 0),
            avgStudentPerformance: Math.round(avgScore),
            performanceLevel: avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Average'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all admins (SuperAdmin only)
// @route   GET /api/reports/admins-list
export const getAdminsList = async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ message: "Access denied" });

        const admins = await User.find({ role: 'admin' }).select('name uniqueId email createdAt').lean();
        
        const adminsWithStats = await Promise.all(admins.map(async (a) => {
            const students = await User.countDocuments({ createdBy: a._id, role: 'student' });
            const classrooms = await Classroom.countDocuments({ createdBy: a._id });
            return { ...a, studentCount: students, classroomCount: classrooms };
        }));

        res.json(adminsWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin-specific performance stats
// @route   GET /api/reports/admin/:id
export const getAdminStats = async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ message: "Access denied" });
        
        const adminId = req.params.id;
        const admin = await User.findById(adminId).select('-password');
        
        const classrooms = await Classroom.find({ createdBy: adminId });
        const students = await User.find({ createdBy: adminId, role: 'student' });
        
        const revenue = await Payment.aggregate([
            { $match: { status: 'completed', student: { $in: students.map(s => s._id) } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const exams = await Exam.find({ classroom: { $in: classrooms.map(c => c._id) } });
        const results = await Result.find({ exam: { $in: exams.map(e => e._id) } });
        
        const avgScore = results.length > 0 
            ? results.reduce((acc, r) => acc + (r.marksObtained / (r.totalMarks || 100)) * 100, 0) / results.length 
            : 0;

        res.json({
            admin,
            totalClassrooms: classrooms.length,
            totalStudents: students.length,
            totalRevenue: revenue[0]?.total || 0,
            avgPerformance: Math.round(avgScore),
            examCount: exams.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats for logged-in teacher
// @route   GET /api/reports/my-teacher-stats
// @access  Private (Teacher)
export const getMyTeacherStats = async (req, res) => {
    try {
        const teacherId = req.user._id;

        // 1. Classrooms assigned to this teacher
        const classrooms = await Classroom.find({ teachers: teacherId })
            .populate('students', 'name email')
            .lean();

        const classroomIds = classrooms.map(c => c._id);

        // 2. Unique students across all classrooms
        const studentIdSet = new Set();
        classrooms.forEach(c => (c.students || []).forEach(s => studentIdSet.add(s._id.toString())));
        const totalStudents = studentIdSet.size;

        // 3. Assignments created by this teacher
        const assignments = await Assignment.find({ teacher: teacherId }).lean();
        const assignmentIds = assignments.map(a => a._id);

        // 4. Submissions for teacher's assignments
        const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
            .populate('student', 'name email')
            .populate('assignment', 'title classroom dueDate')
            .sort({ createdAt: -1 })
            .lean();

        const pendingSubmissions = submissions.filter(s => s.status === 'Submitted').length;
        const gradedSubmissions = submissions.filter(s => s.status === 'Graded').length;

        // 5. Exams created by this teacher
        const exams = await Exam.find({ teacher: teacherId }).lean();
        const activeExams = exams.filter(e => e.isActive);

        // 6. Study materials uploaded by this teacher
        const materialsCount = await StudyMaterial.countDocuments({ uploadedBy: teacherId });

        // 7. Results for teacher's exams
        const examIds = exams.map(e => e._id);
        const results = await Result.find({ exam: { $in: examIds } })
            .populate('exam', 'title subject totalMarks date')
            .lean();

        const avgPerformance = results.length > 0
            ? Math.round(results.reduce((acc, r) => {
                const total = r.exam?.totalMarks || 100;
                return acc + ((r.marksObtained || 0) / total) * 100;
            }, 0) / results.length)
            : 0;

        // 8. Classroom breakdown
        const classroomBreakdown = await Promise.all(classrooms.map(async (cls) => {
            const clsExams = exams.filter(e => e.classroom?.toString() === cls._id.toString());
            const clsExamIds = clsExams.map(e => e._id);
            const clsResults = results.filter(r => clsExamIds.some(id => id.toString() === r.exam?._id?.toString()));
            const clsAssignments = assignments.filter(a => a.classroom?.toString() === cls._id.toString());
            const clsSubmissions = submissions.filter(s => clsAssignments.some(a => a._id.toString() === s.assignment?._id?.toString()));
            const clsPending = clsSubmissions.filter(s => s.status === 'Submitted').length;
            const clsAvg = clsResults.length > 0
                ? Math.round(clsResults.reduce((acc, r) => acc + ((r.marksObtained || 0) / (r.exam?.totalMarks || 100)) * 100, 0) / clsResults.length)
                : 0;

            return {
                _id: cls._id,
                name: cls.name,
                className: cls.className,
                board: cls.board,
                studentCount: cls.students?.length || 0,
                examCount: clsExams.length,
                assignmentCount: clsAssignments.length,
                pendingCount: clsPending,
                avgPerformance: clsAvg,
            };
        }));

        // 9. Subject performance
        const subjectMap = {};
        results.forEach(r => {
            const sub = r.exam?.subject;
            if (!sub) return;
            if (!subjectMap[sub]) subjectMap[sub] = { total: 0, count: 0 };
            subjectMap[sub].total += ((r.marksObtained || 0) / (r.exam?.totalMarks || 100)) * 100;
            subjectMap[sub].count += 1;
        });
        const subjectPerformance = Object.entries(subjectMap).map(([subject, data]) => ({
            subject,
            average: Math.round(data.total / data.count),
            examsTaken: data.count,
        }));

        // 10. Recent submissions (last 8)
        const recentSubmissions = submissions.slice(0, 8).map(s => ({
            _id: s._id,
            studentName: s.student?.name || 'Unknown',
            assignmentTitle: s.assignment?.title || 'Assignment',
            status: s.status,
            submittedAt: s.submittedAt || s.createdAt,
            grade: s.grade || null,
            score: s.score ?? null,
        }));

        res.json({
            totalClassrooms: classrooms.length,
            totalStudents,
            pendingSubmissions,
            gradedSubmissions,
            totalSubmissions: submissions.length,
            totalExams: exams.length,
            activeExams: activeExams.length,
            materialsUploaded: materialsCount,
            avgPerformance,
            classroomBreakdown,
            subjectPerformance,
            recentSubmissions,
        });
    } catch (error) {
        console.error("[MY_TEACHER_STATS] Error:", error);
        res.status(500).json({ message: error.message });
    }
};
