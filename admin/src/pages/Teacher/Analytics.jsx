import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyTeacherStats } from "../../api/services";
import {
    BarChart3,
    Users,
    FileCheck,
    FileText,
    BookOpen,
    TrendingUp,
    GraduationCap,
    Clock,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    PieChart as PieIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";

const TeacherAnalytics = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMyTeacherStats();
                setStats(data);
            } catch (err) {
                console.error("Error loading analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-cyan-600" />
                    <p className="text-sm font-semibold text-slate-500">Loading analytics…</p>
                </div>
            </div>
        );
    }

    const {
        totalClassrooms = 0,
        totalStudents = 0,
        pendingSubmissions = 0,
        gradedSubmissions = 0,
        totalSubmissions = 0,
        totalExams = 0,
        activeExams = 0,
        materialsUploaded = 0,
        avgPerformance = 0,
        classroomBreakdown = [],
        subjectPerformance = [],
        recentSubmissions = [],
    } = stats || {};

    const submissionRate = totalSubmissions > 0
        ? Math.round((gradedSubmissions / totalSubmissions) * 100)
        : 0;

    // Data for Charts
    const submissionData = [
        { name: "Graded", value: gradedSubmissions, color: "#10b981" }, // Emerald-500
        { name: "Pending", value: pendingSubmissions, color: "#f59e0b" }, // Amber-500
    ].filter(d => d.value > 0);

    const classroomChartData = classroomBreakdown.map(cls => ({
        name: cls.name.length > 12 ? cls.name.substring(0, 10) + "..." : cls.name,
        fullName: cls.name,
        score: cls.avgPerformance,
        students: cls.studentCount
    }));

    const subjectRadarData = subjectPerformance.map(sub => ({
        subject: sub.subject,
        A: sub.average,
        fullMark: 100
    }));

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {/* Header */}
            <header>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-cyan-700 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />Back to dashboard
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200 flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em]">Live Reports</p>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
                        </div>
                    </div>
                    
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-black text-slate-900">{avgPerformance}%</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Avg</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-center">
                            <p className="text-2xl font-black text-emerald-600">{submissionRate}%</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Graded Rate</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Top Row: Mini Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                    { label: "Classes", value: totalClassrooms, icon: GraduationCap, color: "text-cyan-600", bg: "bg-cyan-50" },
                    { label: "Students", value: totalStudents, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Exams", value: totalExams, sub: `${activeExams} Active`, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Files", value: materialsUploaded, icon: BookOpen, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "Submissions", value: totalSubmissions, icon: FileCheck, color: "text-violet-600", bg: "bg-violet-50" },
                    { label: "Awaiting", value: pendingSubmissions, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-black text-slate-900">{s.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Classroom Comparison - Large Bar Chart */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Classroom Comparison</h3>
                                <p className="text-xs text-slate-500">Average performance score per batch</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        {classroomChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={classroomChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                    />
                                    <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                                        {classroomChartData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.score >= 70 ? '#10b981' : entry.score >= 40 ? '#6366f1' : '#f43f5e'} 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <p className="text-sm text-slate-400 font-medium">No classroom data to visualize.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submission Status - Pie Chart */}
                <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <PieIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Submission Mix</h3>
                            <p className="text-xs text-slate-500">Grading progress overview</p>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        {submissionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={submissionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {submissionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <p className="text-sm text-slate-400">No submissions yet.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 space-y-3">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold text-slate-600">Graded Work</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">{gradedSubmissions}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-xs font-bold text-slate-600">Needs Review</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">{pendingSubmissions}</span>
                        </div>
                    </div>
                </div>

                {/* Subject Mastery - Radar Chart */}
                <div className="lg:col-span-5 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Subject Mastery</h3>
                            <p className="text-xs text-slate-500">Performance across all topics</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        {subjectRadarData.length >= 3 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectRadarData}>
                                    <PolarGrid stroke="#f1f5f9" />
                                    <PolarAngleAxis 
                                        dataKey="subject" 
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Avg Score"
                                        dataKey="A"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : subjectRadarData.length > 0 ? (
                             <div className="space-y-4">
                                {subjectPerformance.map((sub) => (
                                    <div key={sub.subject} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-800">{sub.subject}</span>
                                            <span className="text-lg font-black text-indigo-700">{sub.average}%</span>
                                        </div>
                                        <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${sub.average}%` }} />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <p className="text-sm text-slate-400">Need at least 3 subjects for radar chart.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Gauge & Recent List */}
                <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <FileCheck className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                                <p className="text-xs text-slate-500">Latest student submissions</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {recentSubmissions.slice(0, 5).map((sub) => (
                            <div key={sub._id} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        sub.status === 'Graded' ? 'bg-emerald-100/50' : 'bg-amber-100/50'
                                    }`}>
                                        {sub.status === 'Graded'
                                            ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            : <Clock className="w-5 h-5 text-amber-600" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{sub.studentName}</p>
                                        <p className="text-[11px] text-slate-500 truncate font-medium">{sub.assignmentTitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {sub.status === 'Graded' && sub.grade && (
                                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                            {sub.grade}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                        {new Date(sub.submittedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => navigate("/teacher/classrooms")}
                        className="w-full mt-6 py-4 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
                    >
                        Review All Submissions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherAnalytics;
