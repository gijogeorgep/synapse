import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Loader2, Search, ArrowRight, Tag, User } from "lucide-react";
import blogService from "../../api/blogService";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await blogService.getBlogs({ isPublished: true });
        setBlogs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error fetching published blogs:", e);
        setError("Failed to load blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) => {
      const title = (b.title || "").toLowerCase();
      const excerpt = (b.excerpt || "").toLowerCase();
      const author = (b.author?.name || "").toLowerCase();
      const tags = Array.isArray(b.tags) ? b.tags.join(" ").toLowerCase() : "";
      return title.includes(q) || excerpt.includes(q) || author.includes(q) || tags.includes(q);
    });
  }, [blogs, searchTerm]);

  return (
    <div className="bg-slate-50/30 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <header className="pt-12 md:pt-20 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-[10px] font-bold uppercase tracking-widest mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Educational Resources
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Knowledge for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Future Leaders</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Expertly crafted study guides, exam strategies, and educational insights to help you excel in your academic journey.
          </p>
        </header>

        <div className="sticky top-24 z-20 mx-auto max-w-3xl">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by topic, keyword, or author..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-transparent focus:outline-none text-slate-700 font-medium placeholder:text-slate-400"
              />
            </div>
            <div className="hidden md:flex items-center gap-2 px-6 border-l border-slate-100 text-sm font-bold text-slate-500">
              <BookOpen className="w-4 h-4 text-cyan-600" />
              <span>{filteredBlogs.length} articles</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-600" />
            <p className="text-slate-500 font-medium animate-pulse">Scanning our library...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-[2rem] bg-rose-50 border border-rose-100 text-rose-700 text-center max-w-md mx-auto shadow-sm">
            <p className="font-bold mb-2 uppercase text-xs tracking-wider">Error Encountered</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto">
               <Search className="w-10 h-10 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
              <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
            <button 
              onClick={() => setSearchTerm("")}
              className="text-cyan-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <Link
                key={blog._id}
                to={`/blogs/${blog.slug || blog._id}`}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
              >
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative shrink-0">
                  {blog.featuredImage ? (
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-slate-400 opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {blog.tags?.length > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm">
                        {blog.tags[0]}
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                     <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-90">
                        <User className="w-3.5 h-3.5" />
                        <span>{blog.author?.name?.split(' ')[0] || "Expert"}</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-[11px] font-bold opacity-90">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}</span>
                     </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 space-y-4">
                  <h2 className="text-xl font-extrabold text-slate-900 line-clamp-2 leading-tight group-hover:text-cyan-600 transition-colors">
                    {blog.title}
                  </h2>
                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                    {blog.excerpt || "Dive deep into this comprehensive guide and discover professional insights tailored for your success."}
                  </p>
                  
                  <div className="pt-4 mt-auto flex items-center justify-between border-t border-slate-50">
                    <span className="inline-flex items-center gap-2 text-cyan-600 font-bold text-sm tracking-tight group-hover:gap-3 transition-all">
                      Read Blueprint
                      <ArrowRight className="w-4 h-4" />
                    </span>
                    <div className="flex gap-1.5">
                       {blog.tags?.slice(1, 3).map(t => (
                         <div key={t} className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-cyan-200 transition-colors" />
                       ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;

