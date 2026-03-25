import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Loader2, Tag, Calendar, User, Share2, Facebook, Twitter, Linkedin, Bookmark } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import blogService from "../../api/blogService";

const BlogPost = () => {
  const { idOrSlug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await blogService.getBlogByIdOrSlug(idOrSlug);

        if (!data || (data.isPublished !== undefined && !data.isPublished)) {
          setNotFound(true);
          setBlog(null);
          return;
        }

        setBlog(data);
        window.scrollTo(0, 0);
      } catch (e) {
        console.error("Error fetching blog:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-600" />
          <p className="text-slate-500 font-medium animate-pulse">Loading study guide...</p>
        </div>
      </div>
    );
  }

  if (notFound || error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
            <Bookmark className="w-10 h-10 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Oops! Blog not found</h2>
            <p className="text-slate-500 italic">"The best way to find yourself is to lose yourself in the service of others." — Mahatma Gandhi</p>
          </div>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      {/* Dynamic Header / Hero */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
        {blog.featuredImage ? (
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-cyan-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/blogs"
                className="glass-effect text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-white hover:text-slate-900 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Resources
              </Link>
              {blog.tags?.slice(0, 1).map(tag => (
                <span key={tag} className="bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 text-cyan-50 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center overflow-hidden">
                   {blog.author?.avatarUrl ? (
                     <img src={blog.author.avatarUrl} alt={blog.author.name} className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-6 h-6 text-white" />
                   )}
                </div>
                <span>By {blog.author?.name || "Synapse Expert"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 opacity-70" />
                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 opacity-70" />
                <span>8 min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {/* Action Bar */}
          <div className="px-6 md:px-12 py-6 border-b border-slate-50 flex items-center justify-between">
             <div className="flex gap-2">
                <button className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-cyan-500 hover:bg-cyan-50 transition-all">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <Linkedin className="w-5 h-5" />
                </button>
             </div>
             <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-50 text-cyan-700 font-bold text-sm hover:bg-cyan-100 transition-all">
               <Share2 className="w-4 h-4" />
               Share Insight
             </button>
          </div>

          {/* Markdown Content */}
          <article className="px-6 md:px-16 py-10 md:py-16 prose-markdown max-w-none">
            {blog.excerpt && (
              <p className="text-xl md:text-2xl text-slate-500 font-medium italic leading-relaxed border-l-4 border-cyan-100 pl-6 mb-12">
                {blog.excerpt}
              </p>
            )}
            
            <ReactMarkdown 
              rehypePlugins={[rehypeRaw]} 
              remarkPlugins={[remarkGfm]}
            >
              {blog.content}
            </ReactMarkdown>
          </article>

          {/* Footer Tags */}
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="px-6 md:px-16 pb-12">
               <div className="flex flex-wrap gap-2 pt-8 border-t border-slate-50">
                {blog.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-100 transition-all cursor-default"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Author Card */}
        <div className="mt-12 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
           <div className="w-24 h-24 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              {blog.author?.avatarUrl ? (
                <img src={blog.author.avatarUrl} alt={blog.author.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-indigo-300" />
              )}
           </div>
           <div className="space-y-3 text-center md:text-left">
              <h4 className="text-xl font-bold text-slate-900">About {blog.author?.name || "Synapse Expert"}</h4>
              <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                Dedicated educator and subject matter expert at Synapse Edu Hub. Committed to helping students 
                unlock their potential through evidence-based study strategies and comprehensive learning materials.
              </p>
              <div className="pt-2 flex justify-center md:justify-start gap-4">
                 <Link to="/blogs" className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors">View all posts</Link>
                 <span className="text-slate-300">|</span>
                 <Link to="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Visit Portal</Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;

