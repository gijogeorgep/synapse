import { useState, useEffect } from "react";
import { GraduationCap, Award, ClipboardCheck, BookOpen, TrendingUp, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyResults, getMyClassrooms, getMyStudentStats, getExams } from "../../api/services";

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(true);
    const [classrooms, setClassrooms] = useState([]);
    const [loadingClassrooms, setLoadingClassrooms] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [upcomingExams, setUpcomingExams] = useState([]);

    const subjects = user?.subjects || ["Physics", "Chemistry", "Mathematics", "Biology"];
    const userClass = user?.class || "10";

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoadingResults(true);
                setLoadingClassrooms(true);

                // Fetch results, classrooms, analytics, and exams in parallel
                const [resultsData, classroomsData, analyticsData, examsData] = await Promise.all([
                    getMyResults().catch(() => []),
                    getMyClassrooms().catch(() => []),
                    getMyStudentStats().catch(() => null),
                    getExams().catch(() => [])
                ]);

                setResults(Array.isArray(resultsData) ? resultsData.filter(r => r.exam) : []);
                const fetchedClassrooms = Array.isArray(classroomsData) ? classroomsData : [];
                setClassrooms(fetchedClassrooms);
                setAnalytics(analyticsData);
                setUpcomingExams(Array.isArray(examsData) ? examsData : []);

                // Redirect independent students to selection if no classrooms
                if (user?.userType === 'independent' && fetchedClassrooms.length === 0) {
                    navigate("/student/select-classroom");
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoadingResults(false);
                setLoadingClassrooms(false);
            }
        };
        fetchDashboardData();
    }, []);

    const examsAttended = results.length;

    // Calculate avg grade from real results
    const calculateAvgGrade = () => {
        if (results.length === 0) return "N/A";
        const totalPercentage = results.reduce((acc, res) => {
            const percentage = res.exam ? (res.score / res.exam.duration) * 100 : 0;
            return acc + percentage;
        }, 0);
        const avg = totalPercentage / results.length;
        if (avg >= 90) return "A+";
        if (avg >= 80) return "A";
        if (avg >= 70) return "B";
        if (avg >= 60) return "C";
        if (avg >= 50) return "D";
        return "F";
    };

    const avgGrade = calculateAvgGrade();
    const rank = user?.stats?.rank || "# -";
    const classesCount = subjects.length;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-cyan-600 font-bold tracking-wide uppercase text-xs mb-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>Student Portal</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">{user?.name?.split(' ')[0] || 'Student'}</span>!
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        You are enrolled in <span className="font-semibold text-slate-700">Class {userClass}</span>. Ready for today's lessons?
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/student/classrooms")}
                        className="px-5 py-3 rounded-full bg-cyan-600 text-white text-sm font-semibold shadow-sm hover:bg-cyan-700 transition-colors"
                    >
                        Open classrooms
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/student/exams")}
                        className="px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-800 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        View exams
                    </button>
                </div>
            </div>

            {/* Overview stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    {
                        label: "Exams attended",
                        value: String(examsAttended),
                        icon: ClipboardCheck,
                        tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
                    },
                    {
                        label: "Classrooms",
                        value: String(classrooms.length),
                        icon: BookOpen,
                        tone: "bg-indigo-50 text-indigo-700 border-indigo-100",
                    },
                    {
                        label: "Average grade",
                        value: String(avgGrade),
                        icon: Award,
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
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${stat.tone}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Allocated Classrooms Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                            My Classrooms
                        </h2>
                        <p className="text-sm text-slate-500">
                            The learning batches you've been assigned to.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/student/classrooms")}
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
                            You have not been assigned to any classrooms yet.
                        </div>
                    ) : (
                        classrooms.slice(0, 3).map(c => (
                            <div key={c._id} onClick={() => navigate("/student/classrooms")} className="p-5 border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md hover:border-cyan-200 cursor-pointer transition-all relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-50/80 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700 z-0"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center mb-4">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-1">{c.name}</h3>
                                    <p className="text-sm font-medium text-cyan-600">Class {c.className} • {c.board}</p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {c.subjects?.slice(0, 3).map(sub => (
                                            <span key={sub} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {/* Combined stack of teachers and students */}
                                            {c.teachers?.slice(0, 2).map((t) => (
                                                <div key={t._id} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold shrink-0 z-10 overflow-hidden" title={`Teacher: ${t.name}`}>
                                                    {t.avatarUrl ? <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" /> : t.name?.charAt(0)}
                                                </div>
                                            ))}
                                            {c.students?.slice(0, 5).map((s, sIdx) => (
                                                <div key={s._id || sIdx} className="w-8 h-8 rounded-full border-2 border-white bg-cyan-100 flex items-center justify-center text-cyan-700 text-[10px] font-bold shrink-0 overflow-hidden" title={s.name}>
                                                    {s.avatarUrl ? <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" /> : s.name?.charAt(0)}
                                                </div>
                                            ))}
                                            {c.students?.length > 5 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-slate-400 text-[10px] font-bold shrink-0">
                                                    +{c.students.length - 5}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400 hover:text-cyan-600 transition-colors">Enter</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Results Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                            Recent Performance
                        </h2>
                        <p className="text-sm text-slate-500">
                            Your most recent exam submissions and scores.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/student/exams")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                        <span>View all results</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loadingResults ? (
                        <div className="md:col-span-3 text-center py-10 text-slate-400">Loading your results...</div>
                    ) : results.length === 0 ? (
                        <div className="md:col-span-3 text-center py-10 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            No exams taken yet. Start with your first assessment!
                        </div>
                    ) : (
                        results.slice(0, 3).map((res) => {
                            const percentage = res.exam ? (res.score / res.exam.duration) * 100 : 0;
                            let grade = 'F';
                            if (percentage >= 90) grade = 'A+';
                            else if (percentage >= 80) grade = 'A';
                            else if (percentage >= 70) grade = 'B';
                            else if (percentage >= 60) grade = 'C';
                            else if (percentage >= 50) grade = 'D';

                            return (
                                <div key={res._id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-cyan-100 hover:bg-cyan-50/50 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-cyan-100 transition-colors">
                                            <Award className="w-5 h-5 text-cyan-600" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${percentage >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            Grade {grade}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 truncate mb-1">{res.exam.title}</h3>
                                    <p className="text-xs text-slate-500 mb-4">{res.exam?.subject || 'General'} • {new Date(res.createdAt).toLocaleDateString()}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-slate-900">
                                            <span className="text-xl font-black">{res.score}</span>
                                            <span className="text-xs text-slate-400 font-bold">Points</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">{Math.floor(res.timeTaken / 60)}m {res.timeTaken % 60}s</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>


            {/* Detailed performance & calendar */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)] gap-6">
                {/* Subject-wise performance */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-7 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Subject-wise performance
                            </h3>
                            <p className="text-sm text-slate-500">
                                See how you are doing in each subject.
                            </p>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(analytics?.subjectPerformance || 
                            subjects.map((s, i) => ({
                                subject: s,
                                average: 0,
                                examsTaken: 0
                            }))
                        ).map((s) => {
                            const grade = s.average >= 90 ? "A+" : s.average >= 80 ? "A" : s.average >= 70 ? "B+" : s.average >= 60 ? "B" : s.average >= 50 ? "C" : "D";
                            return (
                                <div
                                    key={s.subject}
                                    className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {s.subject}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Avg. score {s.average}% • {s.examsTaken} exams
                                        </p>
                                        <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                                                style={{ width: `${Math.min(s.average, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${s.average >= 50 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                            {grade}
                                        </span>
                                        <span className="mt-1 text-[10px] text-slate-400 uppercase tracking-wide">
                                            Grade
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Calendar */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-7 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" />
                                Calendar
                            </h3>
                            <p className="text-sm text-slate-500">
                                Upcoming exams and key events this month.
                            </p>
                        </div>
                    </div>


                        {(() => {
                            const monthNames = [
                                "January",
                                "February",
                                "March",
                                "April",
                                "May",
                                "June",
                                "July",
                                "August",
                                "September",
                                "October",
                                "November",
                                "December",
                            ];
                            const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
                            const daysInMonth = new Date(
                                currentYear,
                                currentMonth + 1,
                                0
                            ).getDate();

                            const examEvents = [
                                ...upcomingExams.map(e => ({
                                    date: new Date(e.date).getDate(),
                                    month: new Date(e.date).getMonth(),
                                    year: new Date(e.date).getFullYear(),
                                    label: e.title,
                                    type: 'upcoming'
                                })),
                                ...results.map(r => ({
                                    date: new Date(r.exam?.date || r.createdAt).getDate(),
                                    month: new Date(r.exam?.date || r.createdAt).getMonth(),
                                    year: new Date(r.exam?.date || r.createdAt).getFullYear(),
                                    label: r.exam?.title || 'Exam',
                                    type: 'past'
                                }))
                            ];

                            const eventByDate = examEvents.reduce((map, e) => {
                                if (e.month === currentMonth && e.year === currentYear) {
                                    map[e.date] = e;
                                }
                                return map;
                            }, {});

                            const cells = [];
                            for (let i = 0; i < firstDay; i += 1) {
                                cells.push(null);
                            }
                            for (let d = 1; d <= daysInMonth; d += 1) {
                                cells.push(d);
                            }

                            return (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm text-slate-600">
                                        <span className="font-semibold">
                                            {monthNames[currentMonth]} {currentYear}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400">
                                        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                                            <span key={d}>{d}</span>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                        {cells.map((day, idx) => {
                                            if (!day) {
                                                return (
                                                    <div
                                                        key={`empty-${idx}`}
                                                        className="h-7 rounded-md"
                                                    />
                                                );
                                            }
                                            const isToday =
                                                day === today.getDate() &&
                                                currentMonth === today.getMonth() &&
                                                currentYear === today.getFullYear();
                                            const event = eventByDate[day];
                                            return (
                                                <div
                                                    key={day}
                                                    className={`h-7 flex flex-col items-center justify-center rounded-md border text-[11px] ${event
                                                        ? "border-cyan-400 bg-cyan-50 text-cyan-700"
                                                        : "border-slate-100 text-slate-600"
                                                        } ${isToday ? "ring-1 ring-indigo-400" : ""}`}
                                                    title={event?.label || ""}
                                                >
                                                    <span>{day}</span>
                                                    {event && (
                                                        <span className="w-1 h-1 rounded-full bg-cyan-500 mt-0.5" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        Dates highlighted in cyan indicate upcoming exams or important
                                        events.
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Quick access */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Quick access</h3>
                        <p className="text-sm text-slate-500">Jump straight into what you need.</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            title: "Classrooms",
                            desc: "Join live class, view lectures & assignments.",
                            onClick: () => navigate("/student/classrooms"),
                        },
                        {
                            title: "Exams",
                            desc: "Start exams and review marks & grades.",
                            onClick: () => navigate("/student/exams"),
                        },
                        {
                            title: "Settings",
                            desc: "Edit profile, photo, and password.",
                            onClick: () => navigate("/student/settings"),
                        },
                    ].map((card) => (
                        <button
                            key={card.title}
                            type="button"
                            onClick={card.onClick}
                            className="text-left p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-cyan-50/60 hover:border-cyan-100 transition-colors group"
                        >
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
        </div>
    );
};

export default StudentDashboard;
