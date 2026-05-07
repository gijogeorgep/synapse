import {
    GraduationCap,
    Users,
    FileText,
    FileCheck,
    ArrowRight,
    Video,
    Upload,
    BookOpen,
    BarChart3,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    TrendingUp,
    Table,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { getTeacherClassrooms, getMyTeacherStats, getSettings } from "../../api/services";

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [classrooms, setClassrooms] = useState([]);
    const [loadingClassrooms, setLoadingClassrooms] = useState(true);
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [settings, setSettings] = useState(null);

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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const data = await getMyTeacherStats();
                setStats(data);
            } catch (error) {
                console.error("Error fetching teacher stats:", error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const totalStudents = stats?.totalStudents ?? 0;
    const pendingSubmissions = stats?.pendingSubmissions ?? 0;
    const totalExams = stats?.totalExams ?? 0;
    const materialsUploaded = stats?.materialsUploaded ?? 0;
    const avgPerformance = stats?.avgPerformance ?? 0;
    const activeExams = stats?.activeExams ?? 0;
    const classroomBreakdown = stats?.classroomBreakdown ?? [];
    const subjectPerformance = stats?.subjectPerformance ?? [];
    const recentSubmissions = stats?.recentSubmissions ?? [];

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
            {loadingStats ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                    <span className="ml-3 text-slate-500 text-sm font-medium">Loading dashboard data...</span>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                label: "My classes",
                                value: String(stats?.totalClassrooms ?? classrooms.length),
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
                                tone: pendingSubmissions > 0
                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-100",
                            },
                            {
                                label: "Exams created",
                                value: String(totalExams),
                                sub: activeExams > 0 ? `${activeExams} active` : null,
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
                                    {stat.sub && (
                                        <p className="text-[11px] font-bold text-emerald-600 mt-1">{stat.sub}</p>
                                    )}
                                </div>
                                <div
                                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${stat.tone}`}
                                >
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Classroom Performance Breakdown */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Classroom Performance</h3>
                                    <p className="text-xs text-slate-500">Average student scores per classroom</p>
                                </div>
                            </div>
                            {classroomBreakdown.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-400">No classroom data yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {classroomBreakdown.map((cls) => (
                                        <div key={cls._id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-sm font-semibold text-slate-800 truncate">{cls.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                                                        {cls.studentCount} students
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {cls.pendingCount > 0 && (
                                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                            {cls.pendingCount} pending
                                                        </span>
                                                    )}
                                                    <span className="text-sm font-extrabold text-slate-900">{cls.avgPerformance}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${
                                                        cls.avgPerformance >= 70 ? "bg-emerald-500" :
                                                        cls.avgPerformance >= 40 ? "bg-amber-500" :
                                                        cls.avgPerformance > 0 ? "bg-rose-500" : "bg-slate-200"
                                                    }`}
                                                    style={{ width: `${Math.max(cls.avgPerformance, 2)}%` }}
                                                />
                                            </div>
                                            <div className="flex gap-3 text-[10px] font-semibold text-slate-400">
                                                <span>{cls.examCount} exams</span>
                                                <span>•</span>
                                                <span>{cls.assignmentCount} assignments</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Subject Performance */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Subject Performance</h3>
                                    <p className="text-xs text-slate-500">Average scores by subject across all exams</p>
                                </div>
                            </div>
                            {subjectPerformance.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-400">No exam results yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {subjectPerformance.map((sub) => {
                                        const bgClass = sub.average >= 70 ? "bg-emerald-50/50 border-emerald-100/50" : sub.average >= 40 ? "bg-amber-50/50 border-amber-100/50" : "bg-rose-50/50 border-rose-100/50";
                                        const textClass = sub.average >= 70 ? "text-emerald-700" : sub.average >= 40 ? "text-amber-700" : "text-rose-700";
                                        const barClass = sub.average >= 70 ? "bg-emerald-500" : sub.average >= 40 ? "bg-amber-500" : "bg-rose-500";
                                        return (
                                            <div key={sub.subject} className={`p-4 rounded-2xl border ${bgClass}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-slate-800">{sub.subject}</span>
                                                    <span className={`text-lg font-extrabold ${textClass}`}>{sub.average}%</span>
                                                </div>
                                                <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${barClass}`}
                                                        style={{ width: `${sub.average}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] font-semibold text-slate-400 mt-2">{sub.examsTaken} exams taken by students</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Quick stats row */}
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-2xl font-extrabold text-slate-900">{materialsUploaded}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Materials uploaded</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-2xl font-extrabold text-slate-900">{avgPerformance}%</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg performance</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Submissions */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                                    <FileCheck className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Recent Submissions</h3>
                                    <p className="text-xs text-slate-500">{stats?.totalSubmissions ?? 0} total submissions • {pendingSubmissions} pending review</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate("/teacher/classrooms")}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                            >
                                <span>Review all</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        {recentSubmissions.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-sm text-slate-400">No submissions received yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentSubmissions.map((sub) => (
                                    <div key={sub._id} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                sub.status === 'Graded' ? 'bg-emerald-50' : 'bg-amber-50'
                                            }`}>
                                                {sub.status === 'Graded'
                                                    ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                                                    : <Clock className="w-4.5 h-4.5 text-amber-600" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{sub.studentName}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{sub.assignmentTitle}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {sub.status === 'Graded' && sub.grade && (
                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                    {sub.grade}
                                                </span>
                                            )}
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                sub.status === 'Graded'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {sub.status}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {new Date(sub.submittedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Quick actions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick actions</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Post live links, upload lecture notes, and review student submissions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        {
                            title: "Update Tracker Sheet",
                            desc: "Update the student tracking excel or google sheet.",
                            icon: Table,
                            onClick: () => {
                                if (settings?.teacherTrackerLink) {
                                    window.open(settings.teacherTrackerLink, "_blank");
                                } else {
                                    alert("Tracker link has not been set by the admin.");
                                }
                            },
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
                        classrooms.slice(0, 3).map(c => {
                            // Find matching breakdown for real per-classroom stats
                            const bd = classroomBreakdown.find(b => b._id === c._id) || {};
                            return (
                                <div key={c._id} onClick={() => navigate("/teacher/classrooms")} className="p-5 border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md cursor-pointer transition-all relative overflow-hidden group" style={{ borderColor: c.themeColor ? `${c.themeColor}20` : undefined }}>
                                    <div 
                                        className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700 z-0 opacity-10"
                                        style={{ background: c.themeColor || '#4f46e5' }}
                                    ></div>
                                    <div className="relative z-10">
                                        <div 
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                                            style={{ background: c.themeColor ? `${c.themeColor}15` : '#eef2ff', color: c.themeColor?.startsWith('linear') ? '#4f46e5' : (c.themeColor || '#4f46e5') }}
                                        >
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-xl text-slate-800 mb-1">{c.name}</h3>
                                        <p className="text-sm font-medium" style={{ color: c.themeColor?.startsWith('linear') ? '#4f46e5' : (c.themeColor || '#4f46e5') }}>Class {c.className} • {c.board}</p>

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
                                            {bd.pendingCount > 0 && (
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                    {bd.pendingCount} pending
                                                </span>
                                            )}
                                            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">Manage</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
