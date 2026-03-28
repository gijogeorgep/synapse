import { BookOpen, FileText, ArrowRight, MoreVertical, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { getMyClassrooms } from "../../api/services";

const StudentClassrooms = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const userClass = user?.class || "10";

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                setLoading(true);
                const data = await getMyClassrooms();
                setClassrooms(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching classrooms:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClassrooms();
    }, []);

    const getSubjectColor = (subject) => {
        const str = subject || '';
        if (str.toLowerCase().includes('physic')) return "from-blue-500 to-indigo-600";
        if (str.toLowerCase().includes('chemist')) return "from-emerald-500 to-teal-600";
        if (str.toLowerCase().includes('math')) return "from-orange-500 to-red-600";
        if (str.toLowerCase().includes('biolog')) return "from-pink-500 to-rose-600";
        if (str.toLowerCase().includes('english')) return "from-purple-500 to-violet-600";
        if (str.toLowerCase().includes('social')) return "from-cyan-500 to-blue-600";

        return "from-slate-500 to-slate-600";
    };

    const openClassroom = (classroom) => {
        navigate("/student/classroom", {
            state: {
                classroom, // pass the entire classroom object to the child route
            },
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-cyan-600 font-bold tracking-wide uppercase text-xs mb-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>Classrooms</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Your subjects
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        You are enrolled in <span className="font-semibold text-slate-700">Class {userClass}</span>. Open a subject to view study materials and take MCQ tests.
                    </p>
                </div>
            </header>

            {/* Google Classroom Style Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="md:col-span-3 text-center py-10 text-slate-400">Loading your classrooms...</div>
                ) : classrooms.length === 0 ? (
                    <div className="md:col-span-3 text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-slate-500 font-medium text-lg">No Classrooms Available</h3>
                        <p className="text-slate-400 text-sm mt-1">You have not been assigned to any classrooms yet.</p>
                    </div>
                ) : (
                    classrooms.map((c, index) => (
                        <div
                            key={c._id}
                            className="group relative bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Card Header Illustration/Background */}
                            <div className={`h-36 relative overflow-hidden p-6 bg-gradient-to-br ${getSubjectColor(c.subjects?.[0])}`}>
                                {c.imageUrl && (
                                    <img 
                                        src={c.imageUrl} 
                                        alt={c.name} 
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 mix-blend-overlay"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                {/* Decorative element */}
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                                <div className={`relative flex justify-between items-start`}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black text-white rounded-lg uppercase tracking-tight">
                                                {c.programType || 'PrimeOne'}
                                            </span>
                                            {c.className !== 'N/A' && (
                                                <span className="px-2 py-0.5 bg-black/10 backdrop-blur-md text-[10px] font-bold text-white rounded-lg uppercase tracking-tight">
                                                    Class {c.className}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">{c.name}</h3>
                                        <p className="text-white/80 text-xs font-bold mt-0.5 uppercase tracking-widest">{c.board}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openClassroom(c)}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                        title="Open classroom"
                                    >
                                        <MoreVertical className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex -space-x-2">
                                        {c.teachers?.slice(0, 3).map((t) => (
                                            <div key={t._id} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700" title={t.name}>
                                                {t.name?.charAt(0)}
                                            </div>
                                        ))}
                                        {c.teachers?.length === 0 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                T
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                                        {c.subjects?.slice(0, 2).map(sub => (
                                            <span key={sub} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100 uppercase tracking-wider">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => openClassroom(c)}
                                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 transition-colors group/item"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-slate-400 group-hover/item:text-cyan-500" />
                                            <span className="text-sm font-medium">Recent Assignments</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openClassroom(c)}
                                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors group/item"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <BookOpen className="w-5 h-5 text-slate-400 group-hover/item:text-indigo-500" />
                                            <span className="text-sm font-medium">Study Materials</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all" />
                                    </button>
                                </div>
                            </div>

                            {/* Footer Action */}
                            <div className="px-6 py-4 border-t border-slate-50 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => openClassroom(c)}
                                    className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center space-x-1 group/btn"
                                >
                                    <span>Go to Class</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentClassrooms;

