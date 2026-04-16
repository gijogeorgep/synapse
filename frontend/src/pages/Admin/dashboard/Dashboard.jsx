import { useEffect, useState } from "react";
import { Users, CreditCard, ShieldCheck, GraduationCap, BookOpen } from "lucide-react";
import { getOverallStats, getClassroomReports } from "../../../api/services";
import { useAuth } from "../../../context/AuthContext";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount || 0);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [overallStats, setOverallStats] = useState(null);
    const [classroomReports, setClassroomReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [statsRes, classroomRes] = await Promise.all([
                    getOverallStats(),
                    getClassroomReports(),
                ]);

                setOverallStats(statsRes || null);
                setClassroomReports(Array.isArray(classroomRes) ? classroomRes : []);
            } catch (error) {
                console.error("Failed to fetch admin dashboard data:", error);
                setOverallStats(null);
                setClassroomReports([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.role]);

    const stats = [
        {
            name: "Total Students",
            value: overallStats?.totalStudents ?? 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            name: "Total Teachers",
            value: overallStats?.totalTeachers ?? 0,
            icon: ShieldCheck,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
        },
        {
            name: "Total Admins",
            value: overallStats?.totalAdmins ?? 0,
            icon: Users,
            color: "text-cyan-600",
            bg: "bg-cyan-50",
        },
        {
            name: "Total Revenue",
            value: formatCurrency(overallStats?.totalRevenue),
            icon: CreditCard,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
    ];

    const topClassrooms = [...classroomReports]
        .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))
        .slice(0, 5);

    const revenueTrends = overallStats?.revenueTrends || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Admin Command Center</h1>
                <p className="text-slate-500 mt-2">Live overview of students, classrooms, exams, and revenue.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className={`${stat.bg} ${stat.color} inline-flex p-3 rounded-2xl`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-slate-500 text-sm font-medium">{stat.name}</h3>
                            <p className="text-2xl font-bold text-slate-800 mt-1">
                                {loading ? "..." : stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Top Classrooms</h2>
                            <p className="text-sm text-slate-500">Ranked by average score from real report data.</p>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-slate-400 text-sm py-8 text-center">Loading classroom analytics...</p>
                    ) : topClassrooms.length === 0 ? (
                        <p className="text-slate-400 text-sm py-8 text-center">No classroom report data available yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {topClassrooms.map((classroom) => (
                                <div key={classroom._id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                    <div>
                                        <p className="font-bold text-slate-800">{classroom.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {classroom.studentCount} students • {classroom.examCount} exams
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Score</p>
                                        <p className="text-lg font-black text-cyan-600">{classroom.avgScore ?? 0}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Revenue Trend</h2>
                            <p className="text-sm text-slate-500">Recent monthly collections from completed payments.</p>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-slate-400 text-sm py-8 text-center">Loading revenue data...</p>
                    ) : revenueTrends.length === 0 ? (
                        <p className="text-slate-400 text-sm py-8 text-center">No revenue trend data available yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {revenueTrends.map((entry) => (
                                <div key={entry.month} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                    <p className="font-bold text-slate-800">{entry.month}</p>
                                    <p className="text-sm font-black text-emerald-600">{formatCurrency(entry.amount)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
