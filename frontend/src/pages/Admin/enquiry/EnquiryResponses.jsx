import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEnquiryResponses, getEnquiryFormById } from "../../../api/services";
import { motion } from "framer-motion";
import { 
    ArrowLeft, 
    Download, 
    Calendar, 
    User, 
    Clock, 
    Filter,
    Search,
    Loader2,
    FileSpreadsheet,
    ChevronRight,
    MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";

const EnquiryResponses = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [formData, responseData] = await Promise.all([
                    getEnquiryFormById(id),
                    getEnquiryResponses(id)
                ]);
                setForm(formData);
                setResponses(responseData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load responses");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const exportToCSV = () => {
        if (!form || responses.length === 0) return;

        const headers = ["Submitted At", ...form.fields.map(f => f.label)];
        const rows = responses.map(r => [
            new Date(r.submittedAt).toLocaleString(),
            ...form.fields.map(f => {
                const val = r.responses[f.label];
                return Array.isArray(val) ? val.join(", ") : val;
            })
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${form.title.replace(/\s+/g, '_')}_responses.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredResponses = responses.filter(r => 
        Object.values(r.responses).some(val => 
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                <p className="text-slate-500 font-medium">Loading responses...</p>
            </div>
        );
    }

    if (!form) return null;

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/enquiry")}
                        className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Form Responses</h1>
                        <p className="text-slate-500 mt-1">{form.title}</p>
                    </div>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 active:scale-95"
                >
                    <FileSpreadsheet className="w-5 h-5" />
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Total Submissions</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{responses.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Today's Submissions</p>
                    <p className="text-3xl font-bold text-cyan-600 mt-1">
                        {responses.filter(r => new Date(r.submittedAt).toDateString() === new Date().toDateString()).length}
                    </p>
                </div>
                <div className="md:col-span-2">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search within responses..."
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {filteredResponses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredResponses.map((res, idx) => (
                        <motion.div
                            key={res._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                        >
                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                <div className="md:w-64 space-y-4">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-bold text-slate-500 uppercase tracking-widest">Date</p>
                                            <p className="text-slate-900 font-bold">{new Date(res.submittedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-bold text-slate-500 uppercase tracking-widest">Time</p>
                                            <p className="text-slate-900 font-bold">{new Date(res.submittedAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    {form.fields.map((field, fIdx) => (
                                        <div key={fIdx} className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{field.label}</p>
                                            <div className="text-slate-700 font-medium">
                                                {res.responses[field.label] ? (
                                                    Array.isArray(res.responses[field.label]) ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {res.responses[field.label].map((v, i) => (
                                                                <span key={i} className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md text-sm font-bold">
                                                                    {v}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-900 font-bold">{res.responses[field.label]}</p>
                                                    )
                                                ) : (
                                                    <p className="text-slate-300 italic">No response</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No responses yet</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Share your form link with students to start collecting data.
                    </p>
                </div>
            )}
        </div>
    );
};

export default EnquiryResponses;
