import LessonReport from "../models/LessonReport.js";
import Classroom from "../models/Classroom.js";

// @desc    Create a new lesson report
// @route   POST /api/lesson-reports
// @access  Private (Teacher/Admin/SuperAdmin)
export const createLessonReport = async (req, res) => {
  try {
    const {
      date,
      subject,
      faculty,
      time,
      duration,
      chapter,
      topic,
      remark,
      class: className,
    } = req.body;

    const report = await LessonReport.create({
      date,
      subject,
      faculty,
      time,
      duration,
      chapter,
      topic,
      remark,
      class: className,
      teacher: req.user._id,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all lesson reports
// @route   GET /api/lesson-reports
// @access  Private
export const getLessonReports = async (req, res) => {
  try {
    let query = {};


    // Support filtering by class (classroom name)
    if (req.user.role === "student") {
      const studentClassrooms = await Classroom.find({ students: req.user._id });
      const enrolledClassNames = studentClassrooms.map((c) => c.name);

      if (req.query.class) {
        // If a specific class is requested, check if the student is enrolled in it
        if (enrolledClassNames.includes(req.query.class)) {
          query.class = req.query.class;
        } else {
          // Student is not enrolled in the requested class
          return res.json([]); 
        }
      } else {
        // No specific class requested, show reports for all enrolled classes
        query.class = { $in: enrolledClassNames };
      }
    } else if (req.query.class) {
      // For Teachers/Admins: filter by class if requested
      query.class = req.query.class;
    }

    const reports = await LessonReport.find(query)
      .populate("teacher", "name")
      .sort({ date: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lesson report
// @route   DELETE /api/lesson-reports/:id
// @access  Private (Owner or Admin)
export const deleteLessonReport = async (req, res) => {
  try {
    const report = await LessonReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check ownership or admin status
    if (
      report.teacher.toString() !== req.user._id.toString() &&
      !["admin", "superadmin"].includes(req.user.role)
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await report.deleteOne();
    res.json({ message: "Report removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lesson report
// @route   PUT /api/lesson-reports/:id
// @access  Private (Owner or Admin)
export const updateLessonReport = async (req, res) => {
  try {
    const report = await LessonReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check ownership or admin status
    if (
      report.teacher.toString() !== req.user._id.toString() &&
      !["admin", "superadmin"].includes(req.user.role)
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const {
      date,
      subject,
      faculty,
      time,
      duration,
      chapter,
      topic,
      remark,
      class: className,
    } = req.body;

    report.date = date || report.date;
    report.subject = subject || report.subject;
    report.faculty = faculty || report.faculty;
    report.time = time || report.time;
    report.duration = duration || report.duration;
    report.chapter = chapter || report.chapter;
    report.topic = topic || report.topic;
    report.remark = remark !== undefined ? remark : report.remark;
    report.class = className || report.class;

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get lesson report statistics for admin dashboard
// @route   GET /api/lesson-reports/stats
// @access  Private (Admin/SuperAdmin)
export const getLessonStats = async (req, res) => {
  try {
    const stats = await LessonReport.aggregate([
      {
        $facet: {
          byFaculty: [
            { $group: { _id: "$faculty", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          bySubject: [
            { $group: { _id: "$subject", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byClass: [
            { $group: { _id: "$class", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byDate: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }, // Last 30 days of activity
          ],
        },
      },
    ]);

    const result = stats[0];

    // Calculate Time-based stats (Parsing duration strings like "1 Hr 30 Mins")
    const allReports = await LessonReport.find({}, "faculty duration subject");
    const timeByFaculty = {};
    const timeBySubject = {};

    allReports.forEach((report) => {
      const duration = report.duration || "";
      let minutes = 0;
      const hrMatch = duration.match(/(\d+)\s*Hr/);
      const minMatch = duration.match(/(\d+)\s*Min/);
      if (hrMatch) minutes += parseInt(hrMatch[1]) * 60;
      if (minMatch) minutes += parseInt(minMatch[1]);

      if (report.faculty) {
        if (!timeByFaculty[report.faculty]) timeByFaculty[report.faculty] = 0;
        timeByFaculty[report.faculty] += minutes;
      }

      if (report.subject) {
        if (!timeBySubject[report.subject]) timeBySubject[report.subject] = { total: 0, count: 0 };
        timeBySubject[report.subject].total += minutes;
        timeBySubject[report.subject].count += 1;
      }
    });

    result.timeByFaculty = Object.keys(timeByFaculty)
      .map((f) => ({
        _id: f,
        minutes: timeByFaculty[f],
        hours: Math.round((timeByFaculty[f] / 60) * 10) / 10,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    result.timeBySubject = Object.keys(timeBySubject)
      .map((s) => ({
        _id: s,
        avgMinutes: Math.round(timeBySubject[s].total / timeBySubject[s].count),
        totalHours: Math.round((timeBySubject[s].total / 60) * 10) / 10,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
