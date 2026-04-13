import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
    Video,
    Link2,
    Upload,
    Users,
    FileCheck,
    ArrowLeft,
    Save,
    ExternalLink,
    AlertCircle,
    Calendar,
    Plus,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { 
    updateClassroomResources, 
    uploadFile, 
    getAssignments, 
    createAssignment, 
    getAssignmentSubmissions, 
    gradeHomework 
} from "../../api/services";

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
    const [students, setStudents] = useState(classroom?.students || []);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const [lectures, setLectures] = useState(classroom?.lectureNotes || []);

    // Assignment & Submission state
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    
    const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        title: "",
        description: "",
        dueDate: ""
    });
    const [creatingAction, setCreatingAction] = useState(false);

    // Grading state
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ grade: "", feedback: "" });
    const [isGrading, setIsGrading] = useState(false);

    // Fetch assignments
    useEffect(() => {
        const fetchAssignments = async () => {
            if (!classroom?._id) return;
            try {
                setLoadingAssignments(true);
                const data = await getAssignments(classroom._id);
                setAssignments(data);
                if (data.length > 0) {
                    setSelectedAssignment(data[0]);
                }
            } catch (error) {
                console.error("Error fetching assignments:", error);
            } finally {
                setLoadingAssignments(false);
            }
        };
        fetchAssignments();
    }, [classroom]);

    // Fetch submissions when an assignment is selected
    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!selectedAssignment?._id) return;
            try {
                setLoadingSubmissions(true);
                const data = await getAssignmentSubmissions(selectedAssignment._id);
                setSubmissions(data);
            } catch (error) {
                console.error("Error fetching submissions:", error);
            } finally {
                setLoadingSubmissions(false);
            }
        };
        fetchSubmissions();
    }, [selectedAssignment]);

    const handleSaveLink = async (e) => {
        e.preventDefault();
        try {
            await updateClassroomResources(classroom._id, {
                onlineClassLink: meetLink
            });
            
            setLinkSaved(true);
            setTimeout(() => setLinkSaved(false), 2000);
        } catch (error) {
            console.error("Error saving link:", error);
            toast.error("Failed to save link");
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        if (!newAssignment.title || !newAssignment.dueDate) {
            toast.error("Title and Due Date are required");
            return;
        }

        try {
            setCreatingAction(true);
            const data = await createAssignment({
                ...newAssignment,
                classroomId: classroom._id
            });
            setAssignments([data, ...assignments]);
            setSelectedAssignment(data);
            setIsCreatingAssignment(false);
            setNewAssignment({ title: "", description: "", dueDate: "" });
            toast.success("Assignment created successfully!");
        } catch (error) {
            console.error("Error creating assignment:", error);
            toast.error("Failed to create assignment");
        } finally {
            setCreatingAction(false);
        }
    };

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        if (!gradingSubmission) return;

        try {
            setIsGrading(true);
            const updated = await gradeHomework(gradingSubmission._id, gradeData);
            setSubmissions(submissions.map(s => s._id === updated._id ? { ...s, ...updated } : s));
            setGradingSubmission(null);
            setGradeData({ grade: "", feedback: "" });
            toast.success("Graded successfully!");
        } catch (error) {
            console.error("Error grading:", error);
            toast.error("Failed to save grade");
        } finally {
            setIsGrading(false);
        }
    };

    const handleUploadLecture = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file); // Use 'file' for PDF uploads

            const uploadData = await uploadFile(formData);

            const newNote = {
                title: file.name.replace(/\.[^/.]+$/, ""),
                url: uploadData.url,
            };

            const updatedClassroom = await updateClassroomResources(classroom._id, {
                lectureNote: newNote
            });

            setLectures(updatedClassroom.lectureNotes);
        } catch (error) {
            console.error("Error uploading lecture:", error);
            toast.error("Failed to upload lecture note");
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
                                Students will see a "Join Class" button in their portal when you save a link here.
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

                    {/* Assignments & Tasks */}
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-emerald-600" />
                                Assignments & Tasks
                            </h2>
                            <button
                                onClick={() => setIsCreatingAssignment(!isCreatingAssignment)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                {isCreatingAssignment ? "Cancel" : "Assign task"}
                            </button>
                        </div>

                        {isCreatingAssignment && (
                            <form onSubmit={handleCreateAssignment} className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Assignment Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAssignment.title}
                                        onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                                        placeholder="e.g. Chapter 1 Practice"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Due Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newAssignment.dueDate}
                                            onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-end shadow-sm">
                                        <button
                                            type="submit"
                                            disabled={creatingAction}
                                            className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-all disabled:opacity-50"
                                        >
                                            {creatingAction ? "Posting..." : "Post assignment"}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Instructions (Optional)</label>
                                    <textarea
                                        value={newAssignment.description}
                                        onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                    />
                                </div>
                            </form>
                        )}

                        {loadingAssignments ? (
                            <div className="flex justify-center py-6 text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-sm text-slate-500">No assignments posted yet.</p>
                            </div>
                        ) : (
                            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                                {assignments.map(a => (
                                    <button
                                        key={a._id}
                                        onClick={() => setSelectedAssignment(a)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                                            selectedAssignment?._id === a._id
                                                ? 'bg-cyan-600 border-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-200'
                                        }`}
                                    >
                                        {a.title}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-6">
                            {selectedAssignment ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-50 pb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due {new Date(selectedAssignment.dueDate).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{submissions.length} submissions</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                        {loadingSubmissions ? (
                                            <div className="flex justify-center py-10">
                                                <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                                            </div>
                                        ) : submissions.length === 0 ? (
                                            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-100">
                                                <p className="text-xs text-slate-400">No submissions yet for this task.</p>
                                            </div>
                                        ) : (
                                            submissions.map((s) => (
                                                <div
                                                    key={s._id}
                                                    className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{s.student?.name}</p>
                                                            <p className="text-[10px] text-slate-500">{s.student?.uniqueId} • Submitted {new Date(s.submittedAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'Graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {s.status}
                                                            </span>
                                                            <a
                                                                href={s.fileUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-cyan-600 transition-colors"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    </div>

                                                    {s.status === 'Graded' ? (
                                                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Result: {s.grade}</span>
                                                                <button onClick={() => { setGradingSubmission(s); setGradeData({ grade: s.grade, feedback: s.feedback }); }} className="text-[10px] font-bold text-cyan-600 hover:underline">Edit</button>
                                                            </div>
                                                            <p className="text-xs text-slate-600 italic">"{s.feedback}"</p>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setGradingSubmission(s)}
                                                            className="text-xs font-bold text-cyan-600 hover:underline text-left w-fit"
                                                        >
                                                            Grade this student →
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : !loadingAssignments && (
                                <div className="text-center py-10">
                                    <p className="text-sm text-slate-400">Select an assignment to view submissions.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Grading Modal */}
                    {gradingSubmission && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Grade Homework</h3>
                                    <p className="text-sm text-slate-500">Student: {gradingSubmission.student?.name}</p>
                                </div>

                                <form onSubmit={handleGradeSubmission} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Grade / Score</label>
                                        <input
                                            type="text"
                                            required
                                            value={gradeData.grade}
                                            onChange={(e) => setGradeData({...gradeData, grade: e.target.value})}
                                            placeholder="e.g. A+, 90/100, Excellent"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Feedback</label>
                                        <textarea
                                            value={gradeData.feedback}
                                            onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                                            rows={4}
                                            placeholder="Enter student feedback..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setGradingSubmission(null)}
                                            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isGrading}
                                            className="flex-[2] py-3 rounded-xl bg-cyan-600 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 disabled:opacity-50"
                                        >
                                            {isGrading ? "Saving..." : "Save Grade"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

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
