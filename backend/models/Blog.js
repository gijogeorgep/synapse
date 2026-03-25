import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        content: {
            type: String,
            required: true,
        },
        excerpt: {
            type: String,
            trim: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        featuredImage: {
            type: String,
            default: "",
        },
        tags: {
            type: [String],
            default: [],
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware to set publishedAt when isPublished toggles to true
blogSchema.pre("save", async function () {
    if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
        this.publishedAt = new Date();
    }
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
