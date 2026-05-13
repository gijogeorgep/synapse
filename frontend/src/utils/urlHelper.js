/**
 * Utility to handle URL generation across different domains (Frontend vs Admin)
 */

export const getPublicSiteUrl = () => {
    // In production, this should be the main frontend domain
    if (import.meta.env.PROD) {
        return "https://synapseeduhub.com";
    }
    
    // In development
    return window.location.origin;
};

export const getFormLink = (slug) => {
    const baseUrl = getPublicSiteUrl();
    return `${baseUrl}/form/${slug}`;
};

export const getAdminUrl = () => {
    if (import.meta.env.PROD) {
        return "https://admin.synapseeduhub.com";
    }
    return "http://localhost:5174"; // Assuming admin runs on 5174 in dev
};
