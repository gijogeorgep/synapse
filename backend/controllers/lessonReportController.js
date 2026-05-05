import LessonReport from "../models/LessonReport.js";

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

    // If teacher, only show their reports
    if (req.user.role === "teacher") {
      query.teacher = req.user._id;
    }

    // Support filtering by class (classroom name)
    if (req.query.class) {
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
