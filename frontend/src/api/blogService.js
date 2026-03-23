import apiClient from "./apiClient.js";

const blogService = {
    getBlogs: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient(`/blogs?${query}`);
    },

    getBlogByIdOrSlug: (idOrSlug) => {
        return apiClient(`/blogs/${idOrSlug}`);
    },

    createBlog: (blogData) => {
        return apiClient("/blogs", {
            method: "POST",
            body: blogData,
        });
    },

    updateBlog: (id, blogData) => {
        return apiClient(`/blogs/${id}`, {
            method: "PUT",
            body: blogData,
        });
    },

    deleteBlog: (id) => {
        return apiClient(`/blogs/${id}`, {
            method: "DELETE",
        });
    },
};

export default blogService;
