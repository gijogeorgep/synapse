import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { getLessonStats } from "../../../api/services";
import { Activity, Users, BookOpen, GraduationCap, Clock } from "lucide-react";

const COLORS = ["#0ea5e9", "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const LessonAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getLessonStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch lesson stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Analytics...</div>;
    if (!stats) return <div className="p-8 text-center text-slate-500">No data available</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Activity className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Lesson Tracker Insights</h2>
                    <p className="text-sm text-slate-500">Deep dive into teacher activity and class distribution.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Faculty Activity Bar Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Classes Taken by Faculty</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.byFaculty}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="_id"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trend Line Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Last 30 Days Activity</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.byDate}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="_id"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    tickFormatter={(str) => str.split('-').slice(1).join('/')}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Subject Distribution</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.bySubject}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {stats.bySubject.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {stats.bySubject.slice(0, 6).map((item, index) => (
                            <div key={item._id} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-xs text-slate-600 truncate">{item._id}</span>
                                <span className="text-xs font-bold text-slate-400 ml-auto">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Class Distribution Bar Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Class Distribution</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.byClass} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} hide />
                                <YAxis
                                    dataKey="_id"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Teaching Time Bar Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Total Teaching Hours</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.timeByFaculty}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="_id"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value} Hours`, "Total Time"]}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="hours" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Avg Session Length Bar Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Avg. Session Length (Mins)</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.timeBySubject} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} hide />
                                <YAxis
                                    dataKey="_id"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    width={100}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value} Mins`, "Avg Duration"]}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="avgMinutes" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonAnalytics;
