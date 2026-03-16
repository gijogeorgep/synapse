import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Video, ExternalLink, BookOpen, ArrowLeft, FileText, Clock, PlayCircle, Award } from "lucide-react";
import { getExamsByClassroom, getMyResults } from "../../api/services";

const StudentClassroom = () => {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [results, setResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const {
        classroom,
        meetLink,
        lectures: fromStateLectures,
        assignments: fromStateAssignments,
    } = location.state || {};

    // Redirect if no classroom data is found
    useEffect(() => {
        if (!classroom) {
            navigate('/student/classrooms');
        }
    }, [classroom, navigate]);

    const fallbackSubject = classroom?.subjects?.[0] || classroom?.name || "Subject";
    const fallbackClass = classroom?.className || user?.class || "10";

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const data = await getExamsByClassroom(fallbackSubject, fallbackClass, "subject-wise");
                setExams(data);
            } catch (error) {
                console.error("Error fetching exams:", error);
            } finally {
                setLoadingExams(false);
            }
        };
        const fetchResults = async () => {
            try {
                const data = await getMyResults();
                // Filter results for this specific subject
                const subjectResults = data.filter(r => r.exam?.subject === fallbackSubject);
                setResults(subjectResults);
            } catch (error) {
                console.error("Error fetching results:", error);
            } finally {
                setLoadingResults(false);
            }
        };
        fetchExams();
        fetchResults();
    }, [fallbackSubject, fallbackClass]);

    const link =
        classroom?.onlineClassLink ||
        "https://meet.google.com/example-class-link";

    const fallbackLectures = [
        {
            id: 1,
            title: `${fallbackSubject} — Introduction`,
            date: "2026-03-01",
            duration: "35 min",
            type: "Video",
            resourceUrl: "#",
        },
        {
            id: 2,
            title: `${fallbackSubject} — Practice Problems Set 1`,
            date: "2026-03-03",
            duration: "Worksheet",
            type: "PDF",
            resourceUrl: "#",
        },
    ];

    const lectures = classroom?.lectureNotes || [];

    const fallbackAssignments = [
        {
            id: 1,
            title: `${fallbackSubject} Homework 1`,
            dueDate: "2026-03-08",
            status: "Pending",
            type: "Worksheet",
            resourceUrl: "#",
        },
        {
            id: 2,
            title: `${fallbackSubject} Quiz Preparation`,
            dueDate: "2026-03-10",
            status: "Completed",
            type: "Quiz",
            resourceUrl: "#",
        },
    ];

    const assignments =
        fromStateAssignments ||
        user?.assignments?.[fallbackSubject] ||
        fallbackAssignments;

    const [classmates, setClassmates] = useState([]);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        if (classroom) {
            if (classroom.students && Array.isArray(classroom.students)) {
                // For now, assume the populated students are available or at least the _id count is accurate
                setClassmates(classroom.students);
            }
            if (classroom.teachers && Array.isArray(classroom.teachers)) {
                setTeachers(classroom.teachers);
            }
        }
    }, [classroom]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-cyan-700"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
            </button>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-cyan-600 uppercase tracking-[0.16em] mb-1">
                        Online classroom
                    </p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {classroom?.name || fallbackSubject}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 text-xs font-bold uppercase tracking-wider">
                            Class {fallbackClass}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                            {classroom?.board || "Board"}
                        </span>
                        {classroom?.subjects?.slice(0, 2).map((sub) => (
                            <span key={sub} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                {sub}
                            </span>
                        ))}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-8">
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Video className="w-5 h-5 text-cyan-600" />
                        Live class link
                    </h2>
                    <p className="text-sm text-slate-500">
                        This is your Google Meet (or any video platform) link for{" "}
                        <span className="font-semibold text-slate-700">{fallbackSubject}</span>.
                        Use it when your class is scheduled.
                    </p>

                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Meeting URL
                            </p>
                            <p className="text-sm font-mono text-slate-800 break-all">
                                {link}
                            </p>
                        </div>
                        <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-cyan-600 text-white text-sm font-semibold shadow-sm hover:bg-cyan-700 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Join live class</span>
                        </a>
                    </div>

                    <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-600" />
                                Recorded lectures & resources
                            </h3>
                            <span className="text-xs font-medium text-slate-400">
                                {lectures?.length || 0} items
                            </span>
                        </div>

                        <div className="space-y-3">
                            {lectures && lectures.length > 0 ? (
                                lectures.map((lecture, index) => (
                                    <div
                                        key={lecture._id || index}
                                        className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 hover:bg-cyan-50/70 border border-slate-100 hover:border-cyan-100 transition-colors"
                                    >
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {lecture.title}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {lecture.createdAt ? new Date(lecture.createdAt).toLocaleDateString() : 'Recent'}
                                            </p>
                                        </div>
                                        <a
                                            href={lecture.url || "#"}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-xs font-semibold text-cyan-700 border border-cyan-100 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-colors shrink-0"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            <span>View</span>
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-slate-400 text-sm">No lecture notes available.</div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                Upcoming & active exams
                            </h3>
                            <span className="text-xs font-medium text-slate-400">
                                {exams?.length || 0} exams
                            </span>
                        </div>

                        <div className="space-y-3">
                            {loadingExams ? (
                                <div className="text-center py-4 text-slate-400 text-sm">Loading exams...</div>
                            ) : exams.length === 0 ? (
                                <div className="text-center py-4 text-slate-400 text-sm">No exams scheduled for this subject.</div>
                            ) : (
                                exams.map((exam) => (
                                    <div
                                        key={exam._id}
                                        className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-100 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {exam.title}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {exam.duration} mins • {exam.isActive ? 'Active' : 'Archived'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate("/student/exams", { state: { startExamId: exam._id } })}
                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-cyan-600 text-white text-xs font-semibold shadow-sm hover:bg-cyan-700 transition-colors"
                                        >
                                            <PlayCircle className="w-4 h-4" />
                                            <span>Take exam</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* My Results Section */}
                    <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-600" />
                                My results for {fallbackSubject}
                            </h3>
                            <span className="text-xs font-medium text-slate-400">
                                {results?.length || 0} scores
                            </span>
                        </div>

                        <div className="space-y-3">
                            {loadingResults ? (
                                <div className="text-center py-4 text-slate-400 text-sm">Loading results...</div>
                            ) : results.length === 0 ? (
                                <div className="text-center py-4 text-slate-400 text-sm">You haven't taken any exams for this subject yet.</div>
                            ) : (
                                results.map((res) => {
                                    const percentage = res.exam ? (res.score / res.exam.duration) * 100 : 0;
                                    let grade = 'F';
                                    if (percentage >= 90) grade = 'A+';
                                    else if (percentage >= 80) grade = 'A';
                                    else if (percentage >= 70) grade = 'B';
                                    else if (percentage >= 60) grade = 'C';
                                    else if (percentage >= 50) grade = 'D';

                                    return (
                                        <div
                                            key={res._id}
                                            className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-900">
                                                    {res.exam?.title || 'Unknown Exam'}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                                                    {new Date(res.createdAt).toLocaleDateString()} • {Math.floor(res.timeTaken / 60)}m {res.timeTaken % 60}s
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                                                    <p className="text-sm font-black text-slate-900">{res.score}</p>
                                                </div>
                                                <span className={`w-8 h-8 rounded-full text-[10px] font-black flex items-center justify-center ${percentage >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {grade}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-cyan-600" />
                                Assignments & classwork
                            </h3>
                            <span className="text-xs font-medium text-slate-400">
                                {assignments?.length || 0} items
                            </span>
                        </div>

                        <div className="space-y-3">
                            {assignments.map((work) => (
                                <div
                                    key={work.id}
                                    className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-100 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {work.title}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Due {work.dueDate} • {work.type}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-[11px] font-semibold ${work.status === "Completed"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-amber-100 text-amber-700"
                                                }`}
                                        >
                                            {work.status}
                                        </span>
                                        <a
                                            href={work.resourceUrl || "#"}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-xs font-semibold text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            <span>Open</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            Class overview
                        </h3>
                        <p className="text-sm text-slate-500">
                            One place for your live link, lecture recordings, assignments, and classmates
                            for this subject.
                        </p>
                        <ul className="mt-1 text-sm text-slate-600 space-y-1 list-disc list-inside">
                            <li>Live class link always in one place</li>
                            <li>Watch recordings shared by your tutor</li>
                            <li>See classmates who are part of this class</li>
                        </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-5">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-slate-900">Classmates</h4>
                                <span className="text-xs text-slate-400">
                                    {classmates.length} students
                                </span>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {classmates.map((mate) => (
                                    <div
                                        key={mate.id}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700">
                                            {(mate.initial || mate.name?.[0] || "?").toUpperCase()}
                                        </div>
                                        <span className="text-sm text-slate-800 font-medium">
                                            {mate.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-slate-900">Teachers</h4>
                                <span className="text-xs text-slate-400">
                                    {teachers.length} {teachers.length === 1 ? "teacher" : "teachers"}
                                </span>
                            </div>
                            <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                                {teachers.length === 0 ? (
                                    <div className="text-xs text-slate-400 py-2">No teachers assigned</div>
                                ) : (
                                    teachers.map((t) => (
                                        <div
                                            key={t._id || t.id}
                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                {(t.name?.[0] || "?").toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-800 font-medium">
                                                    {t.name}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Teacher
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default StudentClassroom;

