/**
 * Generates an initial password based on a formula
 * Formula: Name(first 3 chars) + @ + Phone(last 4 digits)
 * If phone is missing, uses a random 4 digit number
 * @param {string} name 
 * @param {string} phoneNumber 
 * @returns {string} Generated password
 */
export const generateInitialPassword = (name, phoneNumber) => {
    const namePart = (name || "US").slice(0, 2).toUpperCase();
    const phonePart = phoneNumber ? phoneNumber.replace(/\D/g, '').slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();
    
    return `${namePart}${phonePart}`;
};
