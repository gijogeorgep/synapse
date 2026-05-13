/**
 * Utility to get the public site URL.
 * Prioritizes VITE_SITE_URL environment variable, 
 * then falls back to stripping 'admin.' from the current origin if applicable.
 */
export const getPublicSiteUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const origin = window.location.origin;

    // If we're on localhost, always stay on localhost
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return origin.replace(/\/$/, "");
    }
  }

  const envSiteUrl = import.meta.env.VITE_SITE_URL;
  
  if (envSiteUrl && !envSiteUrl.includes("your-domain.com")) {
    return envSiteUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // If we're on an admin subdomain, try to guess the public domain
    if (origin.includes("admin.synapseeduhub.com")) {
      return "https://synapseeduhub.com";
    }
    if (origin.includes("admin.")) {
      return origin.replace("admin.", "").replace(/\/$/, "");
    }
    return origin.replace(/\/$/, "");
  }

  return "";
};

export const getFormLink = (slug) => {
  return `${getPublicSiteUrl()}/form/${slug}`;
};
