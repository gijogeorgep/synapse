import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
    getMaterials, 
    deleteMaterial, 
    getMyClassrooms,
    deleteClassroomResource
} from "../../api/services";
import { 
    BookOpen, 
    FileText, 
    Plus, 
    Search, 
    Trash2, 
    Eye, 
    Filter, 
    Loader2, 
    GraduationCap,
    Clock,
    X,
    AlertCircle,
    FileSpreadsheet,
    Presentation
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../../api/apiClient";
import toast from "react-hot-toast";

const TeacherMaterials = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [classroomFilter, setClassroomFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All"); // All | study_material | question_paper | lecture_note
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [materialsData, classroomsData] = await Promise.all([
                getMaterials(),
                getMyClassrooms()
            ]);
            
            // 1. Process StudyMaterial model uploads
            const studyMaterials = materialsData
                .filter(m => m.uploadedBy === user._id || m.uploadedBy?._id === user._id)
                .map(m => ({
                    ...m,
                    type: 'study_material_model',
                    displayCategory: m.category === 'question_paper' ? 'Question Paper' : 'Study Material',
                    classroomId: m.classroom
                }));

            // 2. Process Classroom model lectureNotes
            const classroomNotes = [];
            classroomsData.forEach(cls => {
                if (cls.lectureNotes && cls.lectureNotes.length > 0) {
                    cls.lectureNotes.forEach(note => {
                        classroomNotes.push({
                            ...note,
                            type: 'lecture_note',
                            displayCategory: 'Lecture Note',
                            subject: cls.subjects?.[0] || 'General',
                            classroomId: cls._id,
                            classroomName: cls.name,
                            fileUrl: note.url, // Map url to fileUrl for consistency
                            fileType: note.url.split('.').pop() || 'pdf'
                        });
                    });
                }
            });

            setMaterials([...studyMaterials, ...classroomNotes]);
            setClassrooms(classroomsData);
        } catch (error) {
            console.error("Error loading teacher materials:", error);
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;
        
        try {
            if (item.type === 'lecture_note') {
                await deleteClassroomResource(item.classroomId, item._id);
            } else {
                await deleteMaterial(item._id);
            }
            toast.success("Material deleted successfully");
            setMaterials(prev => prev.filter(m => m._id !== item._id));
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete material");
        }
    };

    const filteredMaterials = useMemo(() => {
        return materials.filter(m => {
            const matchesQuery = !query || 
                m.title.toLowerCase().includes(query.toLowerCase()) || 
                m.subject.toLowerCase().includes(query.toLowerCase());
            
            const matchesClassroom = classroomFilter === "All" || m.classroomId === classroomFilter;
            
            let matchesType = true;
            if (typeFilter !== "All") {
                if (typeFilter === "lecture_note") {
                    matchesType = m.type === "lecture_note";
                } else if (typeFilter === "question_paper") {
                    matchesType = m.category === "question_paper";
                } else {
                    matchesType = m.category === "study_material";
                }
            }
            
            return matchesQuery && matchesClassroom && matchesType;
        });
    }, [materials, query, classroomFilter, typeFilter]);

    const getIcon = (item) => {
        const ext = (item.fileType || item.fileUrl?.split('.').pop() || '').toLowerCase();
        if (ext === 'ppt' || ext === 'pptx') return <Presentation className="w-6 h-6" />;
        if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return <FileSpreadsheet className="w-6 h-6" />;
        if (item.category === 'question_paper') return <FileText className="w-6 h-6" />;
        return <BookOpen className="w-6 h-6" />;
    };

    if (loading && materials.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Uploaded Resources</h1>
                    <p className="text-slate-500 mt-1">Aggregated view of lecture notes, PPTs, and study materials from all your classrooms.</p>
                </div>
                <button
                    onClick={() => navigate("/teacher/classrooms")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    New Classroom Upload
                </button>
            </header>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title or subject..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium transition-all"
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={classroomFilter}
                                onChange={(e) => setClassroomFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                            >
                                <option value="All">All Classrooms</option>
                                {classrooms.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                        >
                            <option value="All">All Types</option>
                            <option value="study_material">Study Material</option>
                            <option value="question_paper">Question Paper</option>
                            <option value="lecture_note">Lecture Notes / PPTs</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Materials Grid */}
            {filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((m) => (
                        <div 
                            key={m._id} 
                            className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                        m.type === 'lecture_note' ? 'bg-amber-50 text-amber-600' :
                                        m.category === 'question_paper' ? 'bg-emerald-50 text-emerald-600' : 
                                        'bg-indigo-50 text-indigo-600'
                                    }`}>
                                        {getIcon(m)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSelectedMaterial(m)}
                                            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center"
                                            title="View Preview"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(m)}
                                            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center"
                                            title="Delete Material"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{m.title}</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{m.subject}</p>
                                
                                <div className="mt-6 flex items-center gap-4 text-xs font-bold text-slate-500">
                                    <div className="flex items-center gap-1.5 max-w-[150px]">
                                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{m.classroomName || classrooms.find(c => c._id === m.classroomId)?.name || "Global"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(m.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg ${
                                    m.type === 'lecture_note' ? 'bg-amber-100 text-amber-700' :
                                    m.category === 'question_paper' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-indigo-100 text-indigo-700'
                                }`}>
                                    {m.displayCategory}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                    {(m.fileType || m.fileUrl?.split('.').pop() || 'PDF').toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] border border-slate-100 p-20 flex flex-col items-center text-center shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No materials found</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">
                        No materials or lecture notes found in your classrooms. Start by uploading some notes or PPTs inside a classroom!
                    </p>
                </div>
            )}

            {/* Preview Modal */}
            {selectedMaterial && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                    {getIcon(selectedMaterial)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 line-clamp-1">{selectedMaterial.title}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedMaterial.displayCategory}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedMaterial(null)}
                                className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center shadow-inner"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 bg-slate-100 relative overflow-hidden">
                            {(() => {
                                const url = selectedMaterial.fileUrl || selectedMaterial.url;
                                const urlExt = (url.split('?')[0].split('.').pop() || '').toLowerCase();
                                const isPdf = urlExt === 'pdf' || url.toLowerCase().includes('.pdf');
                                const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(urlExt) || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                                const isOffice = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(urlExt);
                                
                                if (isPdf) {
                                    const previewUrl = selectedMaterial.type === 'lecture_note' 
                                        ? `${getApiUrl()}/materials/proxy?url=${encodeURIComponent(url)}&token=${user?.token}`
                                        : `${getApiUrl()}/materials/view/${selectedMaterial._id}/preview.pdf?token=${user?.token}`;
                                    
                                    return (
                                        <iframe
                                            src={previewUrl}
                                            title={selectedMaterial.title}
                                            className="w-full h-full border-none bg-white"
                                        />
                                    );
                                } else if (isImg) {
                                    const previewUrl = selectedMaterial.type === 'lecture_note'
                                        ? `${getApiUrl()}/materials/proxy?url=${encodeURIComponent(url)}&token=${user?.token}`
                                        : `${getApiUrl()}/materials/view/${selectedMaterial._id}?token=${user?.token}`;
                                    
                                    return (
                                        <div className="w-full h-full flex items-center justify-center p-8 bg-white overflow-auto">
                                            <img 
                                                src={previewUrl}
                                                alt={selectedMaterial.title}
                                                className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                                            />
                                        </div>
                                    );
                                } else if (isOffice || url.toLowerCase().includes('.ppt') || url.toLowerCase().includes('.doc')) {
                                    // Use Google Docs Viewer for Office files. 
                                    // Note: Google needs a PUBLIC URL. If Cloudinary is private, this will fail.
                                    // But since these are lecture notes, they are usually public Cloudinary URLs.
                                    const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
                                    return (
                                        <iframe
                                            src={googleUrl}
                                            title={selectedMaterial.title}
                                            className="w-full h-full border-none bg-white"
                                        />
                                    );
                                } else {
                                    return (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white text-center">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                                <Presentation className="w-10 h-10 text-indigo-600" />
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900">Document Preview Not Supported</h4>
                                            <p className="text-sm text-slate-500 max-w-xs mt-2">
                                                This file type cannot be previewed directly in the browser. 
                                                You can try opening it in a new tab or downloading it.
                                            </p>
                                            <a 
                                                href={url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm"
                                            >
                                                Open in New Tab
                                            </a>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-white">
                            <div className="text-xs font-bold text-slate-400">
                                {selectedMaterial.subject} • {(selectedMaterial.fileType || 'PDF').toUpperCase()}
                            </div>
                            <button
                                onClick={() => setSelectedMaterial(null)}
                                className="px-10 py-3 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherMaterials;
