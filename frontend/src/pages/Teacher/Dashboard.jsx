import {
    GraduationCap,
    Users,
    FileText,
    FileCheck,
    ArrowRight,
    Video,
    Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { getTeacherClassrooms } from "../../api/services";

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [classrooms, setClassrooms] = useState([]);
    const [loadingClassrooms, setLoadingClassrooms] = useState(true);

    const teacherSubjects =
        user?.teacherSubjects || user?.subjects || ["Physics", "Chemistry", "Mathematics"];

    // Use standardized service for consistent domain fallback
    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                setLoadingClassrooms(true);
                const data = await getTeacherClassrooms();
                setClassrooms(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching classrooms:", error);
            } finally {
                setLoadingClassrooms(false);
            }
        };
        fetchClassrooms();
    }, []);

    const totalStudents = user?.stats?.totalStudents ?? 96;
    const pendingSubmissions = user?.stats?.pendingSubmissions ?? 12;
    const examsScheduled = user?.stats?.examsScheduled ?? 3;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-cyan-600 font-bold tracking-wide uppercase text-xs mb-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>Teacher Portal</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">{user?.name?.split(" ")[0] || "Teacher"}</span>!
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Manage your classrooms, post live links, upload materials, and review student
                        work.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/teacher/classrooms")}
                        className="px-5 py-3 rounded-full bg-cyan-600 text-white text-sm font-semibold shadow-sm hover:bg-cyan-700 transition-colors"
                    >
                        My classrooms
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/teacher/exams")}
                        className="px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-800 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        Manage exams
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: "My classes",
                        value: String(classrooms.length),
                        icon: GraduationCap,
                        tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
                    },
                    {
                        label: "Total students",
                        value: String(totalStudents),
                        icon: Users,
                        tone: "bg-indigo-50 text-indigo-700 border-indigo-100",
                    },
                    {
                        label: "Pending submissions",
                        value: String(pendingSubmissions),
                        icon: FileCheck,
                        tone: "bg-amber-50 text-amber-700 border-amber-100",
                    },
                    {
                        label: "Exams scheduled",
                        value: String(examsScheduled),
                        icon: FileText,
                        tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
                    },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center justify-between gap-4"
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                {stat.label}
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-slate-900">
                                {stat.value}
                            </p>
                        </div>
                        <div
                            className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${stat.tone}`}
                        >
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick actions</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Post live links, upload lecture notes, and review student submissions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            title: "Classrooms",
                            desc: "Post live links, upload notes, view students.",
                            icon: Video,
                            onClick: () => navigate("/teacher/classrooms"),
                        },
                        {
                            title: "Review submissions",
                            desc: "View and grade work submitted by students.",
                            icon: FileCheck,
                            onClick: () => navigate("/teacher/classrooms"),
                        },
                        {
                            title: "Upload materials",
                            desc: "Add lecture notes, PPT, PDF to your classes.",
                            icon: Upload,
                            onClick: () => navigate("/teacher/classrooms"),
                        },
                    ].map((card) => (
                        <button
                            key={card.title}
                            type="button"
                            onClick={card.onClick}
                            className="text-left p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-cyan-50/60 hover:border-cyan-100 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center mb-3">
                                <card.icon className="w-5 h-5 text-cyan-600" />
                            </div>
                            <p className="text-sm font-bold text-slate-900">{card.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{card.desc}</p>
                            <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700">
                                <span>Open</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* My classes preview */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg md:text-xl font-semibold text-slate-900">Your Allocated Classrooms</h3>
                        <p className="text-sm text-slate-500">The batches you are assigned to teach.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/teacher/classrooms")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                        <span>View all</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingClassrooms ? (
                        <div className="md:col-span-3 text-center py-10 text-slate-400">Loading your classrooms...</div>
                    ) : classrooms.length === 0 ? (
                        <div className="md:col-span-3 text-center py-10 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            You have not been assigned to teach any classrooms yet.
                        </div>
                    ) : (
                        classrooms.slice(0, 3).map(c => (
                            <div key={c._id} onClick={() => navigate("/teacher/classrooms")} className="p-5 border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50/80 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700 z-0"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-1">{c.name}</h3>
                                    <p className="text-sm font-medium text-indigo-600">Class {c.className} • {c.board}</p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {c.subjects?.slice(0, 3).map(sub => (
                                            <span key={sub} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                                        <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
                                            <Users className="w-4 h-4" />
                                            <span>{c.students?.length || 0} Students</span>
                                        </div>
                                        <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Manage</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
