import Blog from "../models/Blog.js";

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = async (req, res) => {
    try {
        const { title, content, excerpt, featuredImage, tags, isPublished } = req.body;

        // Simple slug generation (can be improved)
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        // Check if slug already exists
        const existingBlog = await Blog.findOne({ slug });
        if (existingBlog) {
            return res.status(400).json({ message: "A blog with a similar title already exists." });
        }

        const blog = new Blog({
            title,
            slug,
            content,
            excerpt,
            featuredImage,
            tags,
            isPublished,
            author: req.user._id,
        });

        const createdBlog = await blog.save();
        res.status(201).json(createdBlog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
    try {
        const { isPublished, author, tag } = req.query;
        const query = {};

        if (isPublished !== undefined) {
            query.isPublished = isPublished === "true";
        }
        if (author) {
            query.author = author;
        }
        if (tag) {
            query.tags = tag;
        }

        const blogs = await Blog.find(query)
            .populate("author", "name avatarUrl")
            .sort({ createdAt: -1 });

        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get blog by ID or Slug
// @route   GET /api/blogs/:idOrSlug
// @access  Public
export const getBlogByIdOrSlug = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        let blog;

        if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
            blog = await Blog.findById(idOrSlug).populate("author", "name avatarUrl");
        } else {
            blog = await Blog.findOne({ slug: idOrSlug }).populate("author", "name avatarUrl");
        }

        if (blog) {
            res.json(blog);
        } else {
            res.status(404).json({ message: "Blog not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
export const updateBlog = async (req, res) => {
    try {
        const { title, content, excerpt, featuredImage, tags, isPublished } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (blog) {
            blog.title = title || blog.title;
            blog.content = content || blog.content;
            blog.excerpt = excerpt || blog.excerpt;
            blog.featuredImage = featuredImage || blog.featuredImage;
            blog.tags = tags || blog.tags;
            blog.isPublished = isPublished !== undefined ? isPublished : blog.isPublished;

            if (title) {
                blog.slug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");
            }

            const updatedBlog = await blog.save();
            res.json(updatedBlog);
        } else {
            res.status(404).json({ message: "Blog not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (blog) {
            await blog.deleteOne();
            res.json({ message: "Blog removed" });
        } else {
            res.status(404).json({ message: "Blog not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
