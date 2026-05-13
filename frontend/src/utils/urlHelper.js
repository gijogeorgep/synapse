/**
 * Utility to handle URL generation across different domains (Frontend vs Admin)
 */

export const getPublicSiteUrl = () => {
    // Prefer explicit configuration when available
    const configured = import.meta.env.VITE_SITE_URL;
    if (configured) return configured;

    // In production, fall back to the canonical public domain
    if (import.meta.env.PROD) return "https://synapseeduhub.com";

    // In development, use the current origin
    return window.location.origin;
};

export const getFormLink = (slug) => {
    const baseUrl = getPublicSiteUrl();
    return `${baseUrl}/form/${slug}`;
};

export const getAdminUrl = () => {
    const configured = import.meta.env.VITE_ADMIN_SITE_URL;
    if (configured) return configured;
    if (import.meta.env.PROD) return "https://admin.synapseeduhub.com";
    return "http://localhost:5174"; // Assuming admin runs on 5174 in dev
};
