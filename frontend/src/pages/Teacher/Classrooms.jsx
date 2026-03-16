import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GraduationCap, ArrowRight, Users, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const TeacherClassrooms = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                setLoading(true);
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo?.token}`,
                    },
                };
                const { data } = await axios.get('/api/classrooms/my-classrooms', config);
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

        return "from-slate-500 to-slate-600";
    };

    const openClassroom = (classroom) => {
        navigate("/teacher/classroom", {
            state: {
                classroom, // pass the entire classroom object to the child route
            },
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header>
                <p className="text-xs font-semibold text-cyan-600 uppercase tracking-[0.16em] mb-1">
                    My classes
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Your classrooms
                </h1>
                <p className="mt-2 text-slate-500">
                    Manage live links, upload lecture notes, and view student submissions for each
                    subject.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="md:col-span-3 text-center py-10 text-slate-400">Loading your classrooms...</div>
                ) : classrooms.length === 0 ? (
                    <div className="md:col-span-3 text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-slate-500 font-medium text-lg">No Classrooms Available</h3>
                        <p className="text-slate-400 text-sm mt-1">You have not been assigned to teach any classrooms yet.</p>
                    </div>
                ) : (
                    classrooms.map((c) => (
                        <div
                            key={c._id}
                            className="group relative bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div
                                className={`h-36 bg-gradient-to-br ${getSubjectColor(c.subjects?.[0])} p-6 relative overflow-hidden`}
                            >
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
                                    {c.name}
                                </h3>
                                <p className="text-white/80 text-sm font-medium mt-1">
                                    Class {c.className} • {c.board}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {c.subjects?.slice(0, 3).map(sub => (
                                        <span key={sub} className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shadow-sm">
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span className="flex items-center gap-1 font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                                        <Users className="w-3.5 h-3.5" />
                                        {c.students?.length || 0} students
                                    </span>
                                    <span className="flex items-center gap-1 font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                                        <FileText className="w-3.5 h-3.5" />
                                        Active
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => openClassroom(c)}
                                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 transition-colors group/btn shadow-sm"
                                >
                                    <span className="text-sm font-semibold">Enter classroom</span>
                                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm group-hover/btn:bg-cyan-100 transition-colors">
                                        <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5 text-cyan-700" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeacherClassrooms;
