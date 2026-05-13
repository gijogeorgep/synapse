/**
 * Utility to get the public site URL.
 * Prioritizes VITE_SITE_URL environment variable, 
 * then falls back to stripping 'admin.' from the current origin if applicable.
 */
export const getPublicSiteUrl = () => {
  const envSiteUrl = import.meta.env.VITE_SITE_URL;
  const isDev = import.meta.env.DEV;

  // 1. If we have a canonical URL from environment, use it by default
  if (envSiteUrl && !envSiteUrl.includes("your-domain.com")) {
    // Exception: Only fallback to localhost if we are explicitly in DEV mode
    if (isDev && typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return window.location.origin.replace(/\/$/, "");
      }
    }
    return envSiteUrl.replace(/\/$/, "");
  }

  // 2. Fallback for when VITE_SITE_URL is not defined
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const hostname = window.location.hostname;

    // Local development fallback
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return origin.replace(/\/$/, "");
    }

    // Production admin subdomain fallback
    if (hostname.includes("admin.synapseeduhub.com") || hostname.startsWith("admin.")) {
      return "https://synapseeduhub.com";
    }

    return origin.replace(/\/$/, "");
  }

  return "";
};

export const getFormLink = (slug) => {
  return `${getPublicSiteUrl()}/form/${slug}`;
};
