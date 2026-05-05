import Blog from "../models/Blog.js";
import Program from "../models/Program.js";

// @desc    Generate dynamic sitemap.xml
// @route   GET /api/sitemap.xml
// @access  Public
export const getSitemap = async (req, res) => {
    try {
        const siteUrl = process.env.VITE_SITE_URL || "https://synapseeduhub.com";
        const today = new Date().toISOString().split("T")[0];

        // 1. Static Pages
        const staticPages = [
            { url: "/", lastmod: today, changefreq: "daily", priority: "1.0" },
            { url: "/about", lastmod: today, changefreq: "monthly", priority: "0.8" },
            { url: "/blogs", lastmod: today, changefreq: "daily", priority: "0.9" },
            { url: "/programs", lastmod: today, changefreq: "weekly", priority: "0.9" },
            { url: "/contact", lastmod: today, changefreq: "monthly", priority: "0.7" },
            { url: "/privacy-policy", lastmod: today, changefreq: "yearly", priority: "0.3" },
            { url: "/terms-conditions", lastmod: today, changefreq: "yearly", priority: "0.3" },
        ];

        // 2. Dynamic Blogs
        const blogs = await Blog.find({ isPublished: true }, "slug updatedAt");
        const blogPages = blogs.map((blog) => ({
            url: `/blogs/${blog.slug}`,
            lastmod: (blog.updatedAt || new Date()).toISOString().split("T")[0],
            changefreq: "weekly",
            priority: "0.8",
        }));

        // 3. Dynamic Programs
        const programs = await Program.find({ isPublished: true }, "slug _id updatedAt");
        const programPages = programs.map((program) => ({
            url: `/programs/${program.slug || program._id}`,
            lastmod: (program.updatedAt || new Date()).toISOString().split("T")[0],
            changefreq: "monthly",
            priority: "0.8",
        }));

        const allPages = [...staticPages, ...blogPages, ...programPages];

        // Generate XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        allPages.forEach((page) => {
            xml += `  <url>\n`;
            xml += `    <loc>${siteUrl}${page.url}</loc>\n`;
            xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += `  </url>\n`;
        });

        xml += `</urlset>`;

        res.header("Content-Type", "application/xml");
        res.status(200).send(xml);
    } catch (error) {
        console.error("Sitemap generation error:", error);
        res.status(500).send("Error generating sitemap");
    }
};
