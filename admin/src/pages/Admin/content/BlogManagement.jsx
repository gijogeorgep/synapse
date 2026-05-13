import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    PlusCircle, 
    Trash2, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    X, 
    Edit, 
    Eye,
    Image as ImageIcon,
    Tag as TagIcon,
    Search
} from 'lucide-react';
import blogService from '../../../api/blogService';
import { toast } from 'react-hot-toast';

const BlogManagement = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingBlog, setEditingBlog] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        tags: '',
        isPublished: false
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const data = await blogService.getBlogs();
            setBlogs(data);
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error('Failed to fetch blogs.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            content: blog.content,
            excerpt: blog.excerpt || '',
            featuredImage: blog.featuredImage || '',
            tags: blog.tags ? blog.tags.join(', ') : '',
            isPublished: blog.isPublished
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBlog(null);
        setFormData({
            title: '',
            content: '',
            excerpt: '',
            featuredImage: '',
            tags: '',
            isPublished: false
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const blogData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            };

            if (editingBlog) {
                await blogService.updateBlog(editingBlog._id, blogData);
                toast.success('Blog updated successfully!');
            } else {
                await blogService.createBlog(blogData);
                toast.success('Blog created successfully!');
            }
            
            handleCloseModal();
            fetchBlogs();
        } catch (error) {
            toast.error(error || 'Failed to save blog.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this blog post?")) return;
        try {
            await blogService.deleteBlog(id);
            toast.success('Blog deleted successfully!');
            fetchBlogs();
        } catch (error) {
            console.error("Error deleting blog:", error);
            toast.error('Failed to delete blog.');
        }
    };

    const filteredBlogs = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Blog Management</h1>
                    <p className="text-slate-500 mt-2">Create and publish articles for the Synapse community.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-md shadow-cyan-100 w-full md:w-auto justify-center"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Create New Blog</span>
                </button>
            </div>


            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search blogs by title or author..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredBlogs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">No Blogs Found</h3>
                    <p className="text-slate-400 mt-1">{searchTerm ? "Try a different search term." : "Start by creating your first blog post."}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                        <div key={blog._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group flex flex-col">
                            {blog.featuredImage ? (
                                <div className="h-48 overflow-hidden relative">
                                    <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${blog.isPublished ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                                        {blog.isPublished ? 'Published' : 'Draft'}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 bg-slate-100 flex items-center justify-center relative">
                                    <ImageIcon className="w-12 h-12 text-slate-200" />
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${blog.isPublished ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                                        {blog.isPublished ? 'Published' : 'Draft'}
                                    </div>
                                </div>
                            )}
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mb-3">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>By {blog.author?.name || 'Unknown'}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">{blog.title}</h3>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">{blog.excerpt || 'No excerpt available.'}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {blog.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-cyan-50 text-cyan-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">#{tag}</span>
                                    ))}
                                    {blog.tags.length > 3 && <span className="text-xs text-slate-400">+{blog.tags.length - 3}</span>}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => handleEdit(blog)}
                                            className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                                            title="Edit Blog"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(blog._id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Delete Blog"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button className="flex items-center space-x-1 text-cyan-600 font-bold text-sm hover:underline">
                                        <Eye className="w-4 h-4" />
                                        <span>Preview</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 z-10 border-b border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-800">{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Title</label>
                                        <input 
                                            name="title" 
                                            value={formData.title} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" 
                                            required 
                                            placeholder="Enter a catchy title..." 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Excerpt (Short Summary)</label>
                                        <textarea 
                                            name="excerpt" 
                                            value={formData.excerpt} 
                                            onChange={handleChange} 
                                            rows="3" 
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none resize-none" 
                                            placeholder="Briefly describe what this blog is about..."
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" /> Featured Image URL
                                        </label>
                                        <input 
                                            name="featuredImage" 
                                            value={formData.featuredImage} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" 
                                            placeholder="https://example.com/image.jpg" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                                            <TagIcon className="w-4 h-4" /> Tags (comma separated)
                                        </label>
                                        <input 
                                            name="tags" 
                                            value={formData.tags} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" 
                                            placeholder="education, technology, science..." 
                                        />
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <input 
                                            type="checkbox" 
                                            id="isPublished"
                                            name="isPublished" 
                                            checked={formData.isPublished} 
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                        />
                                        <label htmlFor="isPublished" className="font-bold text-slate-700 cursor-pointer">Publish this article immediately</label>
                                    </div>
                                </div>

                                <div className="space-y-4 flex flex-col">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Content (supports basic text)</label>
                                    <textarea 
                                        name="content" 
                                        value={formData.content} 
                                        onChange={handleChange} 
                                        className="flex-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none resize-none min-h-[300px]" 
                                        required 
                                        placeholder="Write your blog content here..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-slate-100 sticky bottom-0 bg-white">
                                <button type="button" onClick={handleCloseModal} className="flex-1 py-3.5 text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100">
                                    {editingBlog ? 'Update Blog Post' : 'Create & Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogManagement;
