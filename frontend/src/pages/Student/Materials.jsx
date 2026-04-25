import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, FileText, Search, Download, ExternalLink, Filter, Loader2, Eye, X } from "lucide-react";
import { getMaterials } from "../../api/services";
import { getApiUrl } from "../../api/apiClient";

const StudentMaterials = () => {
    const { user } = useAuth();

    const subjects = user?.subjects || ["Physics", "Chemistry", "Mathematics", "Biology"];
    const userClass = user?.class || "10";

    const [activeTab, setActiveTab] = useState("materials"); // materials | papers
    const [query, setQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("All");
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const data = await getMaterials();
                console.log("[STUDENT_MATERIALS] Received from API:", data);
                setMaterials(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching materials:", error);
                console.log("[STUDENT_MATERIALS] Fetch failed");
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    const officialStudyMaterials = useMemo(() => {
        return materials.filter(m => m.category !== 'question_paper');
    }, [materials]);

    const questionPapers = useMemo(() => {
        return materials.filter(m => m.category === 'question_paper');
    }, [materials]);

    const items = useMemo(() => {
        const base = activeTab === "materials" ? officialStudyMaterials : questionPapers;
        return base
            .filter((it) => (subjectFilter === "All" ? true : it.subject === subjectFilter))
            .filter((it) => {
                if (!query.trim()) return true;
                const q = query.toLowerCase();
                return (
                    (it.title || "").toLowerCase().includes(q) ||
                    (it.subject || "").toLowerCase().includes(q) ||
                    (it.fileType || "").toLowerCase().includes(q) ||
                    (it.year || "").toLowerCase().includes(q)
                );
            });
    }, [activeTab, officialStudyMaterials, questionPapers, query, subjectFilter]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-cyan-600 uppercase tracking-[0.16em] mb-1">
                        Official resources
                    </p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Study materials & question papers
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Synapse official notes, worksheets, and previous/model question papers for{" "}
                        <span className="font-semibold text-slate-700">Class {userClass}</span>.
                    </p>
                </div>
            </header>

            {/* Tabs + filters */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab("materials")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "materials"
                                    ? "bg-white text-cyan-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            Study materials
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("papers")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "papers"
                                    ? "bg-white text-cyan-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            Question papers
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search title, subject, type, year…"
                                className="w-full sm:w-80 pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white text-sm"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="w-full sm:w-56 pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white text-sm appearance-none"
                            >
                                <option value="All">All subjects</option>
                                {subjects.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* List */}
                    <div className="lg:col-span-2 space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 text-sm">
                                No results found. Try changing subject filter or search keywords.
                            </div>
                        ) : (
                            items.map((it) => (
                                <div
                                    key={it._id}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50/60 border border-slate-100 hover:border-cyan-100 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                                            {activeTab === "materials" ? (
                                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {it.title}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {it.subject}
                                                {activeTab === "papers" && it.year ? ` • ${it.year}` : ""}
                                                {" • "}
                                                {it.fileType?.toUpperCase()}
                                                {activeTab === "materials" && it.createdAt
                                                    ? ` • Uploaded ${new Date(it.createdAt).toLocaleDateString()}`
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 justify-end">
                                        <button
                                            onClick={() => setSelectedMaterial(it)}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors"
                                            title="Preview File"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View</span>
                                        </button>
                                        <a
                                            href={(it.fileType === 'pdf' || it.fileUrl?.toLowerCase().includes('.pdf')) ? `${getApiUrl()}/materials/view/${it._id}?download=true&token=${user?.token}` : (it.fileUrl ? it.fileUrl.replace('/upload/', '/upload/fl_attachment/') : "#")}
                                            download
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white text-xs font-semibold shadow-sm hover:bg-cyan-700 transition-colors"
                                            title="Download File"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download</span>
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Info card */}
                    <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-fit">
                        <h3 className="text-sm font-bold text-slate-900">
                            What you’ll find here
                        </h3>
                        <ul className="mt-3 text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li>Synapse official notes & worksheets</li>
                            <li>Slides / PPT links shared by Synapse</li>
                            <li>Previous year and model question papers</li>
                        </ul>
                        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs text-slate-500">
                                Tip: Use the subject filter to quickly find resources for a specific
                                subject.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Preview Modal */}
            {selectedMaterial && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center">
                                    {selectedMaterial.fileType === 'pdf' ? (
                                        <BookOpen className="w-6 h-6 text-cyan-600" />
                                    ) : (
                                        <FileText className="w-6 h-6 text-emerald-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{selectedMaterial.title}</h3>
                                    <p className="text-sm text-slate-500">{selectedMaterial.subject}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedMaterial(null)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 bg-slate-50 relative overflow-hidden">
                            {selectedMaterial.fileType === 'pdf' || selectedMaterial.fileUrl?.toLowerCase().includes('.pdf') ? (
                                <iframe
                                    src={`${getApiUrl()}/materials/view/${selectedMaterial._id}/preview.pdf?token=${user?.token}`}
                                    className="w-full h-full border-none"
                                    title={selectedMaterial.title}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-4 md:p-8 overflow-auto">
                                    <img 
                                        src={`${getApiUrl()}/materials/view/${selectedMaterial._id}?token=${user?.token}`}
                                        alt={selectedMaterial.title}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-4 md:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                            <a
                                href={`${getApiUrl()}/materials/view/${selectedMaterial._id}?download=true&token=${user?.token}`}
                                download
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-colors shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </a>
                            <button
                                onClick={() => setSelectedMaterial(null)}
                                className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentMaterials;

