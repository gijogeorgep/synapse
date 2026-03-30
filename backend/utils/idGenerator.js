import Counter from "../models/Counter.js";
import Program from "../models/Program.js";

/**
 * Generates a unique ID in the format SSN24001
 * @param {string} role - 'student', 'teacher', 'admin', 'superadmin'
 * @param {string} programNameOrCode - Program title or specific code
 *
 * Prefix map:
 *   PrimeOne  → P   |  Cluster   → C
 *   PlanB     → B   |  Deep Roots→ D
 *   NEET      → N   |  JEE       → J
 *   PSC       → K   |  General   → G
 */
export const generateUniqueId = async (role, programNameOrCode = "General") => {
    const platform = "S";
    let roleChar = "S";
    let progChar = "G";

    // 1. Role Character
    if (role === 'teacher') {
        roleChar = "T";
    } else if (role === 'admin' || role === 'superadmin') {
        roleChar = "A";
    } else {
        roleChar = "S";
    }

    // 2. Program Character (Standard mapping)
    const normalizedProgram = (programNameOrCode || "General").toUpperCase();
    
    if (normalizedProgram.includes("NEET"))        progChar = "N";
    else if (normalizedProgram.includes("JEE"))    progChar = "J";
    else if (normalizedProgram.includes("PSC"))    progChar = "K"; // K to avoid conflict with PrimeOne (P)
    else if (normalizedProgram.includes("PRIME ONE") || normalizedProgram.includes("PRIMEONE")) progChar = "P";
    else if (normalizedProgram.includes("PLAN B")  || normalizedProgram.includes("PLANB"))     progChar = "B";
    else if (normalizedProgram.includes("CLUSTER"))     progChar = "C";
    else if (normalizedProgram.includes("DEEP ROOTS") || normalizedProgram.includes("DEEPROOTS")) progChar = "D";
    else if (normalizedProgram.length === 1 && normalizedProgram !== "O") progChar = normalizedProgram;
    else {
        // Fallback: Try to find program in DB if not a standard one
        try {
            const prog = await Program.findOne({ 
                $or: [
                    { title: new RegExp(`^${programNameOrCode}$`, 'i') },
                    { code: normalizedProgram }
                ] 
            }).lean();
            if (prog && prog.code) {
                progChar = prog.code.charAt(0).toUpperCase();
            } else {
                progChar = "G"; // General/Other
            }
        } catch (err) {
            progChar = "G";
        }
    }

    // 3. Year
    const year = new Date().getFullYear().toString().slice(-2);

    // 4. Sequence
    // We include year in counter name to potentially reset or segregate sequences by year
    const counterName = `id_${roleChar}_${progChar}_${year}`;
    
    const counter = await Counter.findOneAndUpdate(
        { name: counterName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const seq = counter.seq.toString().padStart(3, '0');

    return `${platform}${roleChar}${progChar}${year}${seq}`;
};

export default generateUniqueId;
