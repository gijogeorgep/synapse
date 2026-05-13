/**
 * Utility to handle URL generation across different domains.
 * Admin app: generates public-facing URLs that point to synapseeduhub.com
 */

export const getPublicSiteUrl = () => {
    // Prefer explicit configuration in all environments
    const configured = import.meta.env.VITE_PUBLIC_SITE_URL;
    if (configured) return configured;

    // In production, fall back to the canonical public domain
    if (import.meta.env.PROD) return "https://synapseeduhub.com";

    // In dev, fall back to the assumed frontend dev server
    return "http://localhost:5173";
};

export const getFormLink = (slug) => {
    const baseUrl = getPublicSiteUrl();
    return `${baseUrl}/form/${slug}`;
};

export const getAdminUrl = () => {
    const configured = import.meta.env.VITE_SITE_URL;
    if (configured) return configured;
    if (import.meta.env.PROD) return "https://admin.synapseeduhub.com";
    return "http://localhost:5174";
};
