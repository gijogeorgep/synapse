import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyStudentStats } from "../../api/services";
import {
    BarChart3,
    TrendingUp,
    Award,
    Clock,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    PieChart as PieIcon,
    FileText,
    Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    AreaChart,
    Area,
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

const StudentAnalytics = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMyStudentStats();
                setStats(data);
            } catch (err) {
                console.error("Error loading student analytics:", err);
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
                    <p className="text-sm font-semibold text-slate-500">Calculating your progress…</p>
                </div>
            </div>
        );
    }

    const {
        performanceHistory = [],
        subjectPerformance = [],
        overallAverage = 0,
        totalExams = 0,
        totalSubmissions = 0,
        gradedSubmissions = 0,
        improvementIndex = 0,
    } = stats || {};

    // Data for Charts
    const submissionData = [
        { name: "Submitted", value: totalSubmissions - gradedSubmissions, color: "#6366f1" }, // Indigo-500
        { name: "Graded", value: gradedSubmissions, color: "#10b981" }, // Emerald-500
    ].filter(d => d.value > 0);

    const trendData = performanceHistory.map(h => ({
        name: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: h.percentage,
        examTitle: h.examTitle
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
                    <ArrowLeft className="w-4 h-4" />Back to portal
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-200 flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-cyan-600 uppercase tracking-[0.2em]">Academic Growth</p>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
                        </div>
                    </div>
                    
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-black text-slate-900">{overallAverage}%</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Score</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-center">
                            <p className={`text-2xl font-black ${improvementIndex >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {improvementIndex > 0 ? `+${improvementIndex}` : improvementIndex}%
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Top Row: Mini Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Exams Taken", value: totalExams, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Mastery Level", value: overallAverage >= 80 ? "Pro" : "Advanced", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Submissions", value: totalSubmissions, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Improvement", value: `${improvementIndex}%`, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
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
                
                {/* Score Trends - Large Area Chart */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Score Trends</h3>
                                <p className="text-xs text-slate-500">Your performance progression over time</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
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
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#6366f1" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorScore)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <p className="text-sm text-slate-400 font-medium">Take more exams to see your trend data.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Subject Mastery - Radar Chart */}
                <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                            <Target className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Subject Mastery</h3>
                            <p className="text-xs text-slate-500">Your average score across subjects</p>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
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
                                        stroke="#06b6d4"
                                        fill="#06b6d4"
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="space-y-4">
                                {subjectPerformance.length > 0 ? subjectPerformance.map((sub) => (
                                    <div key={sub.subject} className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-800">{sub.subject}</span>
                                            <span className="text-lg font-black text-cyan-700">{sub.average}%</span>
                                        </div>
                                        <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                                            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${sub.average}%` }} />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="h-[200px] flex items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-400">No subject data yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <p className="text-xs text-slate-500 text-center font-medium">
                            Radar chart requires data from at least 3 subjects.
                        </p>
                    </div>
                </div>

                {/* Assignment Engagement - Pie Chart */}
                <div className="lg:col-span-5 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <PieIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Submission Mix</h3>
                            <p className="text-xs text-slate-500">Grading status of your work</p>
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
                                <p className="text-sm text-slate-400">No submissions to show.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Exams Table-like view */}
                <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Recent Exam History</h3>
                                <p className="text-xs text-slate-500">Last 5 assessment results</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {performanceHistory.slice(-5).reverse().map((h, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-black text-indigo-600">{h.percentage}%</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{h.examTitle}</p>
                                        <p className="text-[11px] text-slate-500 truncate font-medium">{h.subject} • {new Date(h.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                                        h.percentage >= 80 ? 'bg-emerald-50 text-emerald-600' :
                                        h.percentage >= 50 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        {h.percentage >= 90 ? 'A+' : h.percentage >= 80 ? 'A' : h.percentage >= 70 ? 'B' : 'C'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => navigate("/student/exams")}
                        className="w-full mt-6 py-4 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                    >
                        View Full Exam History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentAnalytics;
