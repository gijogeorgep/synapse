import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
    Video,
    Link2,
    Upload,
    Users,
    FileCheck,
    ArrowLeft,
    Save,
    ExternalLink,
    AlertCircle
} from "lucide-react";

const TeacherClassroom = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const { classroom } = location.state || {};

    // Redirect if no classroom data is found
    useEffect(() => {
        if (!classroom) {
            navigate('/teacher/classrooms');
        }
    }, [classroom, navigate]);

    const fallbackSubject = classroom?.subjects?.[0] || classroom?.name || "Subject";
    const fallbackClass = classroom?.className || "10";

    const [meetLink, setMeetLink] = useState(
        classroom?.onlineClassLink || ""
    );
    const [linkSaved, setLinkSaved] = useState(false);

    // Real data hooks
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);

    const [lectures, setLectures] = useState(classroom?.lectureNotes || []);

    // Fetch students
    useEffect(() => {
        const fetchStudents = async () => {
            if (!classroom?._id) return;
            try {
                setLoadingStudents(true);
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo?.token}`,
                    },
                };
                // You might have a more specific endpoint to fetch users for a classroom,
                // for now we'll assume the classroom object already has some populated
                // students, or we can use the admin endpoint if authorized, or just fallback.
                // Assuming classroom object from previous page might already have populated students:
                if (classroom.students && classroom.students.length > 0 && typeof classroom.students[0] === 'object') {
                    setStudents(classroom.students);
                } else {
                    setStudents([]);
                }
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudents();
    }, [classroom]);



    const submissions =
        user?.submissions?.[fallbackSubject] ||
        [
            {
                id: 1,
                studentName: "Aarav",
                assignmentTitle: "Homework 1",
                submittedAt: "2026-03-05 10:30",
                status: "Submitted",
                fileUrl: "#",
            },
            {
                id: 2,
                studentName: "Diya",
                assignmentTitle: "Homework 1",
                submittedAt: "2026-03-05 11:15",
                status: "Submitted",
                fileUrl: "#",
            },
            {
                id: 3,
                studentName: "Rahul",
                assignmentTitle: "Quiz Prep",
                submittedAt: "2026-03-06 09:00",
                status: "Graded",
                fileUrl: "#",
            },
        ];

    const handleSaveLink = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`,
                },
            };
            await axios.put(`/api/classrooms/${classroom._id}/resources`, {
                onlineClassLink: meetLink
            }, config);
            
            setLinkSaved(true);
            setTimeout(() => setLinkSaved(false), 2000);
        } catch (error) {
            console.error("Error saving link:", error);
            alert("Failed to save link");
        }
    };

    const handleUploadLecture = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Since we don't have a file upload service set up for 'lectureNote' objects yet,
        // we'll simulate the URL for now or if there is an uploadRoute we could use it.
        // Looking at routes, there is an uploadRoutes.js
        
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo?.token}`,
                },
            };

            const formData = new FormData();
            formData.append('image', file); // Use 'image' as per uploadRoutes logic usually

            const { data: uploadData } = await axios.post('/api/upload', formData, config);

            const newNote = {
                title: file.name.replace(/\.[^/.]+$/, ""),
                url: uploadData.url,
            };

            const resourceConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`,
                },
            };

            const { data: updatedClassroom } = await axios.put(`/api/classrooms/${classroom._id}/resources`, {
                lectureNote: newNote
            }, resourceConfig);

            setLectures(updatedClassroom.lectureNotes);
        } catch (error) {
            console.error("Error uploading lecture:", error);
            alert("Failed to upload lecture note");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-cyan-700"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to classrooms
            </button>

            <header>
                <p className="text-xs font-semibold text-cyan-600 uppercase tracking-[0.16em] mb-1">
                    Manage classroom
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
                </div>
                <p className="mt-2 text-slate-500">
                    Post live link, upload lecture notes, and view student submissions.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-8">
                <div className="space-y-6">
                    {/* Live class link */}
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                            <Video className="w-5 h-5 text-cyan-600" />
                            Live class link
                        </h2>
                        <form onSubmit={handleSaveLink} className="space-y-3">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="url"
                                        value={meetLink}
                                        onChange={(e) => setMeetLink(e.target.value)}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    {linkSaved ? "Saved" : "Save"}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500">
                                Students will see this link in their classroom for this subject.
                            </p>
                        </form>
                    </section>

                    {/* Upload lecture notes */}
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                            <Upload className="w-5 h-5 text-indigo-600" />
                            Lecture notes & resources
                        </h2>
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer transition-colors">
                            <Upload className="w-4 h-4" />
                            Upload (PDF, PPT, Slides)
                            <input
                                type="file"
                                accept=".pdf,.ppt,.pptx,.doc,.docx,image/*"
                                className="hidden"
                                onChange={handleUploadLecture}
                            />
                        </label>

                        <div className="mt-4 space-y-2">
                            {lectures.map((lec, index) => (
                                <div
                                    key={lec._id || index}
                                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                                >
                                    <div className="flex-1 min-w-0 mr-4">
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                            {lec.title}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(lec.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <a
                                        href={lec.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 shrink-0"
                                    >
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Student submissions */}
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                            <FileCheck className="w-5 h-5 text-emerald-600" />
                            Student submissions
                        </h2>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {submissions.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-100 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {s.studentName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {s.assignmentTitle} • {s.submittedAt}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-[11px] font-semibold ${s.status === "Graded"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-amber-100 text-amber-700"
                                                }`}
                                        >
                                            {s.status}
                                        </span>
                                        <a
                                            href={s.fileUrl || "#"}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            View
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Students in class */}
                <aside className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-cyan-600" />
                            Students in this class
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {students.length} students enrolled
                        </p>
                    </div>

                    {loadingStudents ? (
                        <div className="text-center py-5 text-sm text-slate-400">Loading students...</div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 font-medium">No students enrolled</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {students.map((s) => (
                                <div
                                    key={s._id || s.id}
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group"
                                >
                                    <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center text-sm font-bold text-cyan-700 shadow-sm border border-cyan-200 group-hover:scale-105 transition-transform" title={s.email}>
                                        {(s.name || "?")[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">
                                            {s.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                            {s.uniqueId || "Student"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default TeacherClassroom;
