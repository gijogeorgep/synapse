import Counter from "../models/Counter.js";

/**
 * Generates a unique ID for students or teachers
 * @param {string} role - 'student' or 'teacher'
 * @param {string} className - Optional class name for student ID format
 * @param {string} board - Optional board name for student ID format
 * @returns {string} - Generated ID (e.g., SSEHC1001 or TSEH20001)
 */
export const generateUniqueId = async (role, className, board) => {
    let counterName, prefix, padLength;

    if (role === 'student' && className) {
        const boardCode = board === 'CBSE' ? 'C' : (board === 'State' ? 'S' : '');
        counterName = `studentId_${boardCode}_${className}`;
        prefix = `SSEH${boardCode}${className}`;
        padLength = 2; // For 01, 02...
    } else {
        counterName = role === "teacher" ? "teacherId" : "studentId";
        prefix = role === "teacher" ? "TSEH" : "SSEH";
        padLength = 5;
    }

    const counter = await Counter.findOneAndUpdate(
        { name: counterName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const paddedSeq = String(counter.seq).padStart(padLength, "0");
    return `${prefix}${paddedSeq}`;
};
