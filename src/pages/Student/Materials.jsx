import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, FileText, Search, Download, ExternalLink, Filter } from "lucide-react";

const StudentMaterials = () => {
    const { user } = useAuth();

    const subjects = user?.subjects || ["Physics", "Chemistry", "Mathematics", "Biology"];
    const userClass = user?.class || "10";

    const [activeTab, setActiveTab] = useState("materials"); // materials | papers
    const [query, setQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("All");

    // TODO: replace with backend official Synapse uploads
    const officialStudyMaterials = [
        {
            id: "m1",
            title: "Class 10 Mathematics – Algebra Notes (Synapse)",
            subject: "Mathematics",
            class: "10",
            type: "PDF",
            uploadedOn: "2026-03-01",
            url: "#",
        },
        {
            id: "m2",
            title: "Physics – Light: Reflection & Refraction (Slides)",
            subject: "Physics",
            class: "10",
            type: "Slides",
            uploadedOn: "2026-03-03",
            url: "#",
        },
        {
            id: "m3",
            title: "Chemistry – Acids, Bases & Salts (Worksheet + Answers)",
            subject: "Chemistry",
            class: "10",
            type: "PDF",
            uploadedOn: "2026-03-05",
            url: "#",
        },
    ];

    const questionPapers = [
        {
            id: "q1",
            title: "CBSE Class 10 – Mathematics 2025 Board Paper",
            subject: "Mathematics",
            class: "10",
            type: "Question Paper",
            year: "2025",
            url: "#",
        },
        {
            id: "q2",
            title: "CBSE Class 10 – Science 2024 Board Paper",
            subject: "Physics",
            class: "10",
            type: "Question Paper",
            year: "2024",
            url: "#",
        },
        {
            id: "q3",
            title: "Synapse Model Paper – Chemistry (Term Test)",
            subject: "Chemistry",
            class: "10",
            type: "Model Paper",
            year: "2026",
            url: "#",
        },
    ];

    const items = useMemo(() => {
        const base = activeTab === "materials" ? officialStudyMaterials : questionPapers;
        return base
            .filter((it) => (it.class ? String(it.class) === String(userClass) : true))
            .filter((it) => (subjectFilter === "All" ? true : it.subject === subjectFilter))
            .filter((it) => {
                if (!query.trim()) return true;
                const q = query.toLowerCase();
                return (
                    it.title.toLowerCase().includes(q) ||
                    (it.subject || "").toLowerCase().includes(q) ||
                    (it.type || "").toLowerCase().includes(q) ||
                    (it.year || "").toLowerCase().includes(q)
                );
            });
    }, [activeTab, officialStudyMaterials, questionPapers, query, subjectFilter, userClass]);

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
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                activeTab === "materials"
                                    ? "bg-white text-cyan-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-800"
                            }`}
                        >
                            Study materials
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("papers")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                activeTab === "papers"
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
                        {items.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 text-sm">
                                No results found. Try changing subject filter or search keywords.
                            </div>
                        ) : (
                            items.map((it) => (
                                <div
                                    key={it.id}
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
                                                {it.subject} • Class {it.class}
                                                {activeTab === "papers" && it.year ? ` • ${it.year}` : ""}
                                                {" • "}
                                                {it.type}
                                                {activeTab === "materials" && it.uploadedOn
                                                    ? ` • Uploaded ${it.uploadedOn}`
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 justify-end">
                                        <a
                                            href={it.url || "#"}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            <span>View</span>
                                        </a>
                                        <a
                                            href={it.url || "#"}
                                            download
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white text-xs font-semibold shadow-sm hover:bg-cyan-700 transition-colors"
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
        </div>
    );
};

export default StudentMaterials;

