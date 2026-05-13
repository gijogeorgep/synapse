import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEnquiryForms, deleteEnquiryForm, updateEnquiryForm } from "../../../api/services";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    FileText, 
    Link as LinkIcon, 
    MoreVertical, 
    Trash2, 
    Eye, 
    Edit, 
    CheckCircle, 
    XCircle,
    Copy,
    ExternalLink,
    Search,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const EnquiryFormList = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const data = await getEnquiryForms();
            setForms(data);
        } catch (error) {
            console.error("Error fetching forms:", error);
            toast.error("Failed to load forms");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this form and all its responses?")) return;
        try {
            await deleteEnquiryForm(id);
            setForms(forms.filter(f => f._id !== id));
            toast.success("Form deleted successfully");
        } catch (error) {
            toast.error("Failed to delete form");
        }
    };

    const toggleStatus = async (form) => {
        try {
            await updateEnquiryForm(form._id, { isActive: !form.isActive });
            setForms(forms.map(f => f._id === form._id ? { ...f, isActive: !f.isActive } : f));
            toast.success(`Form ${!form.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const copyLink = (slug) => {
        const url = `${window.location.origin}/form/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const filteredForms = forms.filter(f => 
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enquiry Forms</h1>
                    <p className="text-slate-500 mt-1">Create and manage custom data collection forms.</p>
                </div>
                <Link
                    to="/admin/enquiry/create"
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Create New Form
                </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Total Forms</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{forms.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Active Forms</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{forms.filter(f => f.isActive).length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Inactive Forms</p>
                    <p className="text-3xl font-bold text-slate-400 mt-1">{forms.filter(f => !f.isActive).length}</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search forms by title or description..."
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                    <p className="text-slate-500 font-medium">Loading your forms...</p>
                </div>
            ) : filteredForms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredForms.map((form) => (
                            <motion.div
                                key={form._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-2xl ${form.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => toggleStatus(form)}
                                                className={`p-2 rounded-xl transition-colors ${form.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}
                                                title={form.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {form.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(form._id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{form.title}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">
                                        {form.description || "No description provided."}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400 font-medium">Fields</span>
                                            <span className="text-slate-900 font-bold bg-slate-50 px-2 py-0.5 rounded-lg">{form.fields.length} questions</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400 font-medium">Status</span>
                                            <span className={`font-bold ${form.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {form.isActive ? 'Live' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                                    <Link
                                        to={`/admin/enquiry/responses/${form._id}`}
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Responses
                                    </Link>
                                    <button
                                        onClick={() => copyLink(form.slug)}
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Link
                                    </button>
                                    <a
                                        href={`${window.location.origin}/form/${form.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all col-span-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open Live Form
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No forms found</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        {searchQuery ? "Try adjusting your search query." : "Get started by creating your first enquiry form for students."}
                    </p>
                    {!searchQuery && (
                        <Link
                            to="/admin/enquiry/create"
                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:scale-105 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Form
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default EnquiryFormList;
