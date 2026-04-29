import { useEffect } from "react";

const SITE_NAME = "Synapse Connect";
const DEFAULT_DESCRIPTION =
  "Achieve academic success with Synapse Connect, India's most focused learning ecosystem. Expert mentors and mock tests for NEET, JEE, and PSC with multilingual support.";
const DEFAULT_KEYWORDS =
  "Synapse Connect, Synapse Kerala, NEET coaching Kerala, JEE mock tests, PSC exam preparation, online tuition Kerala, multilingual education India, expert academic mentoring";

const setOrRemoveMetaTag = (attr, key, content) => {
  const selector = `meta[${attr}="${key}"]`;
  let tag = document.head.querySelector(selector);

  if (!content) {
    tag?.remove();
    return;
  }

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const setOrRemoveLinkTag = (rel, href) => {
  const selector = `link[rel="${rel}"]`;
  let tag = document.head.querySelector(selector);

  if (!href) {
    tag?.remove();
    return;
  }

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
};

const resolveSiteUrl = () => {
  const envSiteUrl = import.meta.env.VITE_SITE_URL?.trim();

  if (envSiteUrl && !envSiteUrl.includes("your-domain.com")) {
    return envSiteUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  return "";
};

const toAbsoluteUrl = (value, siteUrl) => {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, siteUrl || "http://localhost").toString();
  } catch {
    return value;
  }
};

const SEO = ({
  title = SITE_NAME,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = "/synapse favicon.png",
  url,
  canonicalPath,
  type = "website",
  author = SITE_NAME,
  noindex = false,
  publishedTime,
  modifiedTime,
  structuredData,
}) => {
  const serializedStructuredData = JSON.stringify(structuredData ?? null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const siteUrl = resolveSiteUrl();
    const pageUrl = toAbsoluteUrl(
      url || canonicalPath || `${window.location.pathname}${window.location.search}`,
      siteUrl
    );
    const imageUrl = toAbsoluteUrl(image, siteUrl);
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const robotsContent = noindex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

    document.title = fullTitle;

    setOrRemoveMetaTag("name", "description", description);
    setOrRemoveMetaTag("name", "keywords", keywords);
    setOrRemoveMetaTag("name", "author", author);
    setOrRemoveMetaTag("name", "robots", robotsContent);
    setOrRemoveMetaTag("name", "googlebot", robotsContent);
    setOrRemoveMetaTag("name", "theme-color", "#06b6d4");

    setOrRemoveMetaTag("property", "og:site_name", SITE_NAME);
    setOrRemoveMetaTag("property", "og:locale", "en_IN");
    setOrRemoveMetaTag("property", "og:type", type);
    setOrRemoveMetaTag("property", "og:title", fullTitle);
    setOrRemoveMetaTag("property", "og:description", description);
    setOrRemoveMetaTag("property", "og:url", pageUrl);
    setOrRemoveMetaTag("property", "og:image", imageUrl);
    setOrRemoveMetaTag("property", "og:image:alt", title);

    setOrRemoveMetaTag("name", "twitter:card", "summary_large_image");
    setOrRemoveMetaTag("name", "twitter:title", fullTitle);
    setOrRemoveMetaTag("name", "twitter:description", description);
    setOrRemoveMetaTag("name", "twitter:image", imageUrl);

    setOrRemoveMetaTag("property", "article:published_time", publishedTime);
    setOrRemoveMetaTag("property", "article:modified_time", modifiedTime);
    setOrRemoveLinkTag("canonical", noindex ? "" : pageUrl);

    Array.from(document.head.querySelectorAll('script[data-seo="structured-data"]')).forEach((node) => {
      node.remove();
    });

    const schemaItems = Array.isArray(structuredData)
      ? structuredData
      : structuredData
        ? [structuredData]
        : [];

    schemaItems.forEach((item) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "structured-data");
      script.text = JSON.stringify(item);
      document.head.appendChild(script);
    });
  }, [
    title,
    description,
    keywords,
    image,
    url,
    canonicalPath,
    type,
    author,
    noindex,
    publishedTime,
    modifiedTime,
    structuredData,
    serializedStructuredData,
  ]);

  return null;
};

export default SEO;
