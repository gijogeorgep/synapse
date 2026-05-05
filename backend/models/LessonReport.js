import mongoose from "mongoose";

const lessonReportSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    faculty: {
      type: String,
      required: true,
    },
    time: {
      type: String, 
      required: true,
    },
    duration: {
      type: String, 
      required: true,
    },
    chapter: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    remark: {
      type: String,
    },
    class: {
      type: String,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LessonReport = mongoose.model("LessonReport", lessonReportSchema);

export default LessonReport;
