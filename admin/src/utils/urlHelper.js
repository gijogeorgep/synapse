/**
 * Utility to handle URL generation across different domains.
 * Admin app: generates public-facing URLs that point to synapseeduhub.com
 */

export const getPublicSiteUrl = () => {
    // In production, always point to the main public frontend
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_PUBLIC_SITE_URL || "https://synapseeduhub.com";
    }
    // In dev, point to the frontend dev server
    return "http://localhost:5173";
};

export const getFormLink = (slug) => {
    const baseUrl = getPublicSiteUrl();
    return `${baseUrl}/form/${slug}`;
};

export const getAdminUrl = () => {
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_SITE_URL || "https://admin.synapseeduhub.com";
    }
    return "http://localhost:5174";
};
