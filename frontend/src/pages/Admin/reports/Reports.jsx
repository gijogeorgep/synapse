import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
    TrendingUp, Users, GraduationCap, Award, Search, Filter, 
    ChevronRight, Calendar, BookOpen, Clock, ArrowUpRight, ArrowDownRight, 
    Divide, User, BarChart2, PieChart as PieChartIcon, Activity,
    Download, FileText, Table as TableIcon, DollarSign, Target
} from 'lucide-react';
import { 
    getOverallStats, getClassroomReports, getStudentReport, 
    getSubjectStats, getStudentsListForReports, getTeachersListForReports,
    getAdminsListForReports, getTeacherReport, getAdminReport
} from '../../../api/services';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '../../../context/AuthContext';

const Reports = () => {
    const { user } = useAuth();
    const [overallStats, setOverallStats] = useState(null);
    const [classrooms, setClassrooms] = useState([]);
    const [subjectStats, setSubjectStats] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); 
    const [searchQuery, setSearchQuery] = useState('');
    
    // Student Deep Dive
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [loadingStudent, setLoadingStudent] = useState(false);

    // Teacher Deep Dive
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [teacherData, setTeacherData] = useState(null);
    const [loadingTeacher, setLoadingTeacher] = useState(false);

    // Admin Deep Dive
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [adminData, setAdminData] = useState(null);
    const [loadingAdmin, setLoadingAdmin] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const isSuper = user?.role === 'superadmin';
            
            const [statsRes, classroomsRes, subjectRes, studentsRes, teachersRes, adminsRes] = await Promise.all([
                getOverallStats(),
                getClassroomReports(),
                getSubjectStats(),
                getStudentsListForReports(),
                getTeachersListForReports(),
                isSuper ? getAdminsListForReports() : Promise.resolve([])
            ]);
            setOverallStats(statsRes);
            setClassrooms(Array.isArray(classroomsRes) ? classroomsRes : []);
            setSubjectStats(Array.isArray(subjectRes) ? subjectRes : []);
            setStudents(Array.isArray(studentsRes) ? studentsRes : []);
            setTeachers(Array.isArray(teachersRes) ? teachersRes : []);
            setAdmins(Array.isArray(adminsRes) ? adminsRes : []);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            setClassrooms([]);
            setOverallStats(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentDeepDive = async (studentId) => {
        try {
            setLoadingStudent(true);
            const res = await getStudentReport(studentId);
            setStudentData(res);
            setSelectedStudent(res.student);
        } catch (error) {
            console.error("Student report error:", error);
        } finally {
            setLoadingStudent(false);
        }
    };

    const fetchTeacherDeepDive = async (teacherId) => {
        try {
            setLoadingTeacher(true);
            const res = await getTeacherReport(teacherId);
            setTeacherData(res);
            setSelectedTeacher(res.teacher);
        } catch (error) {
            console.error("Teacher report error:", error);
        } finally {
            setLoadingTeacher(false);
        }
    };

    const fetchAdminDeepDive = async (adminId) => {
        try {
            setLoadingAdmin(true);
            const res = await getAdminReport(adminId);
            setAdminData(res);
            setSelectedAdmin(res.admin);
        } catch (error) {
            console.error("Admin report error:", error);
        } finally {
            setLoadingAdmin(false);
        }
    };

    const handleStudentSearch = async (e) => {
        if (e.key === 'Enter' && searchQuery) {
            // Find student in our pre-loaded list first
            const found = students.find(s => s.uniqueId.toLowerCase() === searchQuery.toLowerCase() || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
            if (found) {
                fetchStudentDeepDive(found._id);
            }
        }
    };

    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportOverallPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Synapse Institute - Performance Summary', 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        
        const stats = [
            ['Metric', 'Value'],
            ['Total Students', overallStats?.totalStudents || 0],
            ['Total Teachers', overallStats?.totalTeachers || 0],
            ['Total Revenue', `Rs. ${overallStats?.totalRevenue || 0}`],
            ['Avg. Performance', `${overallStats?.avgPerformance || 0}%`]
        ];
        
        doc.autoTable({
            startY: 40,
            head: [stats[0]],
            body: stats.slice(1),
            theme: 'striped'
        });

        doc.text('Classroom Performance Audit', 14, doc.lastAutoTable.finalY + 10);
        
        const classroomRows = classrooms.map(c => [
            c.name, c.studentCount, c.examCount, `${c.avgScore}%`, c.performanceLevel
        ]);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Classroom', 'Students', 'Exams', 'Avg Score', 'Status']],
            body: classroomRows,
        });

        doc.save('synapse-overall-report.pdf');
    };

    const exportStudentPDF = () => {
        if (!selectedStudent || !studentData) return;
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(99, 102, 241); // Indigo color
        doc.text(`Student Academic Audit: ${selectedStudent.name}`, 14, 25);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Student ID: ${selectedStudent.uniqueId}`, 14, 32);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

        const summaryData = [
            ['Exams Taken', studentData.examsTaken],
            ['Overall Average', `${studentData.overallAverage}%`],
            ['Improvement Index', `${studentData.improvementIndex >= 0 ? '+' : ''}${studentData.improvementIndex}%`]
        ];

        doc.autoTable({
            startY: 45,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] }
        });

        doc.text('Subject Mastery Breakdown', 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Subject', 'Average Score']],
            body: studentData.subjectPerformance.map(s => [s.subject, `${s.average}%`]),
        });

        doc.text('Full Exam History', 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Exam Title', 'Date', 'Score', 'Percentage']],
            body: studentData.performanceHistory.map(h => [
                h.examTitle, new Date(h.date).toLocaleDateString(), `${h.score}/${h.total}`, `${h.percentage}%`
            ]),
        });

        doc.save(`student-report-${selectedStudent.uniqueId}.pdf`);
    };

    const exportTeacherPDF = () => {
        if (!selectedTeacher || !teacherData) return;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(99, 102, 241);
        doc.text(`Teacher Performance Audit: ${selectedTeacher.name}`, 14, 25);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Email: ${selectedTeacher.email}`, 14, 32);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

        const summaryData = [
            ['Managed Classrooms', teacherData.classrooms?.length],
            ['Total Students', teacherData.totalStudents],
            ['Avg Student Performance', `${teacherData.avgStudentPerformance}%`],
            ['Total Exams Conducted', teacherData.totalExams],
            ['Teaching Rating', teacherData.performanceLevel]
        ];

        doc.autoTable({
            startY: 45,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] }
        });

        doc.text('Classroom Coverage', 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Classroom Name', 'Student Count']],
            body: teacherData.classrooms.map(c => [c.name, c.studentCount]),
        });

        doc.save(`teacher-report-${selectedTeacher.name.replace(/\s+/g, '-')}.pdf`);
    };

    const exportAdminPDF = () => {
        if (!selectedAdmin || !adminData) return;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text(`Admin Branch Audit: ${selectedAdmin.name}`, 14, 25);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Email: ${selectedAdmin.email}`, 14, 32);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

        const summaryData = [
            ['Total Revenue Managed', `Rs. ${adminData.totalRevenue}`],
            ['Managed Students', adminData.totalStudents],
            ['Managed Classrooms', adminData.totalClassrooms],
            ['Average Academic Rating', `${adminData.avgPerformance}%`]
        ];

        doc.autoTable({
            startY: 45,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }
        });

        doc.save(`admin-branch-report-${selectedAdmin.name.replace(/\s+/g, '-')}.pdf`);
    };

    const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
                    <p className="text-slate-500 font-medium">Performance tracking & academic insights</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'classrooms', label: 'Classrooms' },
                            { id: 'student', label: 'Students' },
                            { id: 'teacher', label: 'Teachers' },
                            ...(user?.role === 'superadmin' ? [{ id: 'admin', label: 'Admins' }] : [])
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSearchQuery('');
                                }}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                            <Download size={18} className="text-indigo-600" />
                            Export Data
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                             <button 
                                onClick={() => exportToCSV(classrooms, 'classroom-audit')}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-600"
                            >
                                <TableIcon size={16} className="text-emerald-500" /> CSV Export
                            </button>
                            <button 
                                onClick={exportOverallPDF}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-600"
                            >
                                <FileText size={16} className="text-red-500" /> PDF Summary
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Students', value: overallStats?.totalStudents, icon: Users, color: 'indigo', trend: '+12%' },
                            { label: 'Total Revenue', value: `Rs. ${overallStats?.totalRevenue || 0}`, icon: DollarSign, color: 'emerald', trend: '+18%' },
                            { label: 'Avg. Performance', value: `${overallStats?.avgPerformance || 0}%`, icon: TrendingUp, color: 'emerald', trend: '+5.4%' },
                            { label: 'Exams Conducted', value: overallStats?.totalExams, icon: Award, color: 'amber', trend: '+8' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg`}>
                                        {stat.trend}
                                    </span>
                                </div>
                                <h3 className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">{stat.label}</h3>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Revenue Trends */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <TrendingUp className="text-indigo-600" />
                                    Institutional Revenue Trends
                                </h2>
                                <span className="text-xs font-bold text-slate-400">Last 6 Months</span>
                            </div>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={overallStats?.revenueTrends || []}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Engagement Funnel */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                             <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                                <Activity className="text-emerald-500" />
                                Engagement Funnel
                            </h2>
                            <div className="space-y-8 mt-10">
                                {(overallStats?.engagementFunnel || []).map((step, i) => (
                                    <div key={i} className="relative">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-slate-600">{step.name}</span>
                                            <span className="text-sm font-black text-slate-900">{step.value}</span>
                                        </div>
                                        <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${
                                                    i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-cyan-500' : 'bg-emerald-500'
                                                }`} 
                                                style={{width: `${(step.value / (overallStats?.engagementFunnel[0]?.value || 1)) * 100}%`}}
                                            ></div>
                                        </div>
                                        {i < (overallStats?.engagementFunnel?.length - 1) && (
                                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-slate-300">
                                                <ChevronRight className="rotate-90 w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 text-center">Efficiency Score</p>
                                <p className="text-2xl font-black text-indigo-700 text-center">
                                    {Math.round((overallStats?.engagementFunnel[2]?.value / (overallStats?.engagementFunnel[0]?.value || 1)) * 100)}%
                                </p>
                            </div>
                        </div>

                        {/* Classroom Benchmarking */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                                <Target className="text-amber-500" />
                                Top 5 Classroom Benchmarks
                            </h2>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={overallStats?.classroomComparison || []} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} width={150} />
                                        <Tooltip 
                                            cursor={{fill: '#f8fafc', radius: 10}}
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        />
                                        <Bar dataKey="average" fill="#f59e0b" radius={[0, 10, 10, 0]} barSize={30}>
                                            {(overallStats?.classroomComparison || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Subject Mastery Radar */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                                <Award className="text-indigo-600" />
                                Curriculum Mastery
                            </h2>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={overallStats?.subjectMastery || []}>
                                        <PolarGrid stroke="#f1f5f9" />
                                        <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Average Mastery"
                                            dataKey="average"
                                            stroke="#6366f1"
                                            fill="#6366f1"
                                            fillOpacity={0.6}
                                        />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'classrooms' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Classroom Performance Audit</h2>
                        <div className="flex gap-4">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Filter by name..." 
                                    className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64 outline-none"
                                />
                             </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="px-8 py-5">Classroom Info</th>
                                    <th className="px-8 py-5">Students</th>
                                    <th className="px-8 py-5">Exams</th>
                                    <th className="px-8 py-5">Avg Score</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(classrooms || []).map((cls) => (
                                    <tr key={cls._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-slate-800">{cls.name}</p>
                                            <p className="text-xs text-slate-500">Board: {cls.board || 'State'}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-500" style={{width: `${Math.min(cls.studentCount * 2, 100)}%`}}></div>
                                                </div>
                                                <span className="text-sm font-bold text-slate-600">{cls.studentCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">{cls.examCount} Exams</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-lg font-black text-slate-900">{cls.avgScore}%</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                cls.performanceLevel === 'Excellent' ? 'bg-emerald-50 text-emerald-600' :
                                                cls.performanceLevel === 'Good' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {cls.performanceLevel}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100">
                                                <ChevronRight className="w-5 h-5 text-slate-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'student' && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    {!selectedStudent ? (
                        <>
                            {/* Student Selection List */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800">Student Directory</h2>
                                        <p className="text-slate-500 font-medium">Select a student to generate a deep-dive report</p>
                                    </div>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                                        <input 
                                            type="text" 
                                            placeholder="Search by ID or Name..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 w-full md:w-80 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                                            <tr>
                                                <th className="px-8 py-5">Student Info</th>
                                                <th className="px-8 py-5">Unique ID</th>
                                                <th className="px-8 py-5">Classrooms</th>
                                                <th className="px-8 py-5"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {students.filter(s => 
                                                s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                s.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
                                            ).map((s) => (
                                                <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => fetchStudentDeepDive(s._id)}>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black">
                                                                {s.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800">{s.name}</p>
                                                                <p className="text-xs text-slate-500">{s.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <code className="text-xs font-black bg-slate-100 px-2 py-1 rounded-md text-slate-600">{s.uniqueId}</code>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-wrap gap-1">
                                                            {(s.enrolledClassrooms || []).map((c, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-md text-[10px] font-bold">
                                                                    {c.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="flex items-center gap-1 text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">
                                                            View Audit <ChevronRight size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Back Button */}
                            <button 
                                onClick={() => { setSelectedStudent(null); setStudentData(null); }}
                                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
                            >
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                                    <ChevronRight className="rotate-180 w-5 h-5" />
                                </div>
                                Back to Student List
                            </button>

                            {studentData && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 space-y-8">
                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                                            <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-indigo-50">
                                                <User size={64} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900">{selectedStudent.name}</h3>
                                            <p className="text-indigo-600 font-bold mb-4">{selectedStudent.uniqueId}</p>
                                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Exams</p>
                                                    <p className="text-xl font-black text-slate-800">{studentData.examsTaken}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Avg. Score</p>
                                                    <p className="text-xl font-black text-indigo-600">{studentData.overallAverage}%</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={exportStudentPDF}
                                                className="w-full mt-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-black transition-all shadow-lg"
                                            >
                                                <FileText size={18} />
                                                Download PDF Report
                                            </button>
                                        </div>

                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                                Subject Mastery
                                            </h4>
                                            <div className="space-y-6">
                                                {studentData.subjectPerformance.map((sub, i) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-sm font-bold text-slate-600">{sub.subject}</span>
                                                            <span className="text-sm font-black text-slate-900">{sub.average}%</span>
                                                        </div>
                                                        <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-1000" style={{width: `${sub.average}%`}}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                            <h4 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                                                <TrendingUp className="text-emerald-500" />
                                                Performance Progression
                                            </h4>
                                            <div className="h-[400px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={studentData.performanceHistory}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="examTitle" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} domain={[0, 100]} />
                                                        <Tooltip 
                                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="percentage" 
                                                            stroke="#6366f1" 
                                                            strokeWidth={4} 
                                                            dot={{fill: '#6366f1', strokeWidth: 2, r: 6, stroke: '#fff'}}
                                                            activeDot={{r: 8, strokeWidth: 0}}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'teacher' && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    {!selectedTeacher ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                             <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Teacher Directory</h2>
                                    <p className="text-slate-500 font-medium">Analyze teacher involvement and classroom effectiveness</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => exportToCSV(teachers, 'teacher-directory')}
                                        className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                                        title="Export CSV"
                                    >
                                        <Download size={20} />
                                    </button>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                                        <input 
                                            type="text" 
                                            placeholder="Search teachers..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 w-full md:w-80 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                                        <tr>
                                            <th className="px-8 py-5">Teacher Info</th>
                                            <th className="px-8 py-5">Managed Classrooms</th>
                                            <th className="px-8 py-5">Total Students</th>
                                            <th className="px-8 py-5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {teachers.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map((t) => (
                                            <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => fetchTeacherDeepDive(t._id)}>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black">
                                                            {t.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{t.name}</p>
                                                            <p className="text-xs text-slate-500">{t.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-black">{t.classroomCount} Classes</span>
                                                </td>
                                                <td className="px-8 py-6 text-slate-600 font-bold">{t.studentCount} Students</td>
                                                <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="flex items-center gap-1 text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">
                                                        Teacher Audit <ChevronRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                             <button 
                                onClick={() => { setSelectedTeacher(null); setTeacherData(null); }}
                                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
                            >
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                                    <ChevronRight className="rotate-180 w-5 h-5" />
                                </div>
                                Back to Teacher Directory
                            </button>

                            {teacherData && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                                            <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-indigo-50">
                                                <Users size={64} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900">{selectedTeacher.name}</h3>
                                            <p className="text-indigo-600 font-bold mb-4">{selectedTeacher.email}</p>
                                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Managed Classes</p>
                                                    <p className="text-xl font-black text-slate-800">{teacherData.classrooms?.length}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Performance</p>
                                                    <p className="text-xl font-black text-indigo-600">{teacherData.avgStudentPerformance}%</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={exportTeacherPDF}
                                                className="w-full mt-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-black transition-all shadow-lg"
                                            >
                                                <FileText size={18} />
                                                Generate Teacher Audit
                                            </button>
                                        </div>

                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                            <h4 className="text-lg font-bold text-slate-800 mb-6">Classroom Coverage</h4>
                                            <div className="space-y-4">
                                                {teacherData.classrooms.map((c, i) => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                                                        <span className="font-bold text-slate-700">{c.name}</span>
                                                        <span className="text-xs font-black bg-white px-2 py-1 rounded-lg text-slate-500">{c.studentCount} Students</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4">
                                                    <Award size={24} />
                                                </div>
                                                <h3 className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">Teaching Rating</h3>
                                                <p className="text-3xl font-black text-slate-900">{teacherData.performanceLevel}</p>
                                            </div>
                                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-4">
                                                    <FileText size={24} />
                                                </div>
                                                <h3 className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">Total Exams</h3>
                                                <p className="text-3xl font-black text-slate-900">{teacherData.totalExams}</p>
                                            </div>
                                        </div>

                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                            <h4 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                                                <TrendingUp className="text-indigo-600" />
                                                Academic Impact
                                            </h4>
                                            <p className="text-slate-500 font-medium mb-6">Average student performance across all classrooms managed by {selectedTeacher.name}</p>
                                            <div className="flex items-center gap-6">
                                                <div className="w-48 h-48 relative">
                                                    <PieChart width={200} height={200}>
                                                        <Pie
                                                            data={[{value: teacherData.avgStudentPerformance}, {value: 100 - teacherData.avgStudentPerformance}]}
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            startAngle={90}
                                                            endAngle={-270}
                                                            dataKey="value"
                                                        >
                                                            <Cell fill="#6366f1" />
                                                            <Cell fill="#f1f5f9" />
                                                        </Pie>
                                                    </PieChart>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-3xl font-black text-slate-900">{teacherData.avgStudentPerformance}%</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Students Reached</p>
                                                        <p className="text-2xl font-black text-slate-900">{teacherData.totalStudents}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'admin' && user?.role === 'superadmin' && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    {!selectedAdmin ? (
                         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => exportToCSV(admins, 'admin-directory')}
                                        className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                                        title="Export CSV"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                                        <tr>
                                            <th className="px-8 py-5">Admin Info</th>
                                            <th className="px-8 py-5">Managed Students</th>
                                            <th className="px-8 py-5">Classrooms</th>
                                            <th className="px-8 py-5">Joined Date</th>
                                            <th className="px-8 py-5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {admins.map((a) => (
                                            <tr key={a._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => fetchAdminDeepDive(a._id)}>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-black">
                                                            {a.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{a.name}</p>
                                                            <p className="text-xs text-slate-500">{a.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-slate-600 font-bold">{a.studentCount} Students</td>
                                                <td className="px-8 py-6 text-slate-600 font-bold">{a.classroomCount} Classrooms</td>
                                                <td className="px-8 py-6 text-slate-400 text-sm font-medium">{new Date(a.createdAt).toLocaleDateString()}</td>
                                                <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                                                        Branch Audit <ChevronRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                             <button 
                                onClick={() => { setSelectedAdmin(null); setAdminData(null); }}
                                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
                            >
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                                    <ChevronRight className="rotate-180 w-5 h-5" />
                                </div>
                                Back to Admin Directory
                            </button>

                            {adminData && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                                            <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-emerald-50">
                                                <Target size={64} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900">{selectedAdmin.name}</h3>
                                            <p className="text-emerald-600 font-bold mb-4">{selectedAdmin.email}</p>
                                            <div className="pt-6 border-t border-slate-50">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Branch Financial Performance</p>
                                                <p className="text-3xl font-black text-emerald-600">Rs. {adminData.totalRevenue}</p>
                                            </div>
                                            <button 
                                                onClick={exportAdminPDF}
                                                className="w-full mt-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-black transition-all shadow-lg"
                                            >
                                                <FileText size={18} />
                                                Export Branch Audit
                                            </button>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { label: 'Students', value: adminData.totalStudents, icon: Users, color: 'indigo' },
                                                { label: 'Classrooms', value: adminData.totalClassrooms, icon: TableIcon, color: 'cyan' },
                                                { label: 'Avg. Rating', value: `${adminData.avgPerformance}%`, icon: Award, color: 'amber' }
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                                    <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl w-fit mb-4`}>
                                                        <stat.icon size={20} />
                                                    </div>
                                                    <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">{stat.label}</h3>
                                                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                            <h4 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                                                <DollarSign className="text-emerald-500" />
                                                Revenue Audit
                                            </h4>
                                            <div className="h-[300px] flex items-end gap-4">
                                                 {/* Simple Bar visualization for branch vs total if needed */}
                                                 <div className="w-full bg-slate-50 rounded-3xl p-8 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-slate-500 font-bold text-sm mb-2">Total Managed Revenue</p>
                                                        <h3 className="text-4xl font-black text-slate-900">Rs. {adminData.totalRevenue}</h3>
                                                        <p className="text-emerald-600 font-bold text-xs mt-2">+12.4% from last month</p>
                                                    </div>
                                                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                                                        <DollarSign size={40} className="text-emerald-500" />
                                                    </div>
                                                 </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
