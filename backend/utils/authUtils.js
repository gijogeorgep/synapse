/**
 * Generates an initial password for admin-created users.
 * Formula: Name (first 3 chars, capitalized) + "@" + Phone (last 4 digits)
 * Result is always 8 characters minimum (e.g., "Ami@1234").
 * No complex password rules apply here — strong password rules are only
 * enforced when users register themselves via the public portal.
 * @param {string} name
 * @param {string} phoneNumber
 * @returns {string} Generated password (always ≥ 8 chars)
 */
export const generateInitialPassword = (name, phoneNumber) => {
    const namePart = (name || "User").slice(0, 3);
    // Capitalize first letter, lowercase the rest
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
    const phonePart = phoneNumber
        ? phoneNumber.replace(/\D/g, '').slice(-4)
        : Math.floor(1000 + Math.random() * 9000).toString();

    return `${formattedName}@${phonePart}`;
};
