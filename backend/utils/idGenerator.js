import Counter from "../models/Counter.js";

/**
 * Generates a unique ID in the format SSEHX1001
 * @param {string} role - 'student' or 'teacher'
 * @param {string} classroomType - 'NEET', 'JEE', 'PSC', or 'Other'
 */
export const generateUniqueId = async (role, classroomType = "Other") => {
    let prefix = "SSEH";
    let middleChar = "";

    if (role === 'teacher') {
        middleChar = "T";
    } else {
        // Default to 'Other' if not specified or empty
        const type = (classroomType || "Other").toUpperCase();
        if (type.includes("NEET")) middleChar = "N";
        else if (type.includes("JEE")) middleChar = "J";
        else if (type.includes("PSC")) middleChar = "P";
        else middleChar = "O";
    }

    const counterName = `id_${middleChar}`;
    
    const counter = await Counter.findOneAndUpdate(
        { name: counterName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return `${prefix}${middleChar}${counter.seq}`;
};

export default generateUniqueId;
