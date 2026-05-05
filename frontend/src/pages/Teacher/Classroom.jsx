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
    Loader2,
    Trash2,
    X,
    BookOpen,
    Download
} from "lucide-react";
import { 
    updateClassroomResources, 
    uploadFile, 
    getAssignments, 
    createAssignment, 
    getAssignmentSubmissions, 
    gradeHomework,
    deleteAssignment,
    deleteClassroomResource
} from "../../api/services";
import { getApiUrl } from "../../api/apiClient";

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

    useEffect(() => {
        setMeetLink(classroom?.onlineClassLink || "");
    }, [classroom?._id, classroom?.onlineClassLink]);

    const fallbackSubject = classroom?.subjects?.[0] || classroom?.name || "Subject";
    const fallbackClass = classroom?.className || "10";

    const [meetLink, setMeetLink] = useState(
        classroom?.onlineClassLink || ""
    );

    // Real data hooks
    const [students] = useState(classroom?.students || []);
    const [loadingStudents] = useState(false);

    const [lectures, setLectures] = useState(classroom?.lectureNotes || []);

    // Assignment & Submission state
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [previewSubmission, setPreviewSubmission] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState("");
    
    const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        title: "",
        description: "",
        dueDate: "",
        maxPoints: 100,
    });
    const [creatingAction, setCreatingAction] = useState(false);

    // Grading state
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ score: "", feedback: "" });
    const [isGrading, setIsGrading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, id: null });
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const getSubmissionScore = (submission) => {
        if (submission?.score !== null && submission?.score !== undefined) {
            return submission.score;
        }
        const parsed = Number(String(submission?.grade || "").split("/")[0]);
        return Number.isFinite(parsed) ? parsed : "";
    };

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

    useEffect(() => {
        let objectUrl = "";

        const loadPreview = async () => {
            if (!previewSubmission?._id) {
                setPreviewUrl("");
                setPreviewLoading(false);
                setPreviewError("");
                return;
            }

            const userInfo = localStorage.getItem("userInfo")
                ? JSON.parse(localStorage.getItem("userInfo"))
                : null;

            if (!userInfo?.token) {
                setPreviewError("Not authorized, no token");
                setPreviewUrl("");
                setPreviewLoading(false);
                return;
            }

            setPreviewLoading(true);
            setPreviewError("");

            try {
                const response = await fetch(
                    `${getApiUrl()}/assignments/submissions/${previewSubmission._id}/view`,
                    {
                        headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                    }
                );

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || `Preview failed (${response.status})`);
                }

                const blob = new Blob([await response.arrayBuffer()], { type: "application/pdf" });
                objectUrl = URL.createObjectURL(blob);
                setPreviewUrl(objectUrl);
            } catch (error) {
                console.error("Error loading submission preview:", error);
                setPreviewError(error.message || "Unable to preview file");
                setPreviewUrl("");
            } finally {
                setPreviewLoading(false);
            }
        };

        loadPreview();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [previewSubmission?._id]);



    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        if (!newAssignment.title || !newAssignment.dueDate) {
            toast.error("Title and Due Date are required");
            return;
        }

        try {
            const parsedMaxPoints = Number(newAssignment.maxPoints);
            setCreatingAction(true);
            const data = await createAssignment({
                ...newAssignment,
                maxPoints: Number.isFinite(parsedMaxPoints) && parsedMaxPoints > 0 ? parsedMaxPoints : 100,
                classroomId: classroom._id
            });
            setAssignments([data, ...assignments]);
            setSelectedAssignment(data);
            setIsCreatingAssignment(false);
            setNewAssignment({ title: "", description: "", dueDate: "", maxPoints: 100 });
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
            setGradeData({ score: "", feedback: "" });
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

    const executeDeleteLecture = async (noteId) => {
        try {
            const updatedClassroom = await deleteClassroomResource(classroom._id, noteId);
            setLectures(updatedClassroom.lectureNotes);
            toast.success("Lecture note deleted");
        } catch (error) {
            console.error("Error deleting lecture:", error);
            toast.error("Failed to delete lecture note");
        } finally {
            setDeleteConfirm({ isOpen: false, type: null, id: null });
        }
    };

    const executeDeleteAssignment = async (assignmentId) => {
        try {
            await deleteAssignment(assignmentId);
            const remaining = assignments.filter(a => a._id !== assignmentId);
            setAssignments(remaining);
            if (selectedAssignment?._id === assignmentId) {
                setSelectedAssignment(remaining.length > 0 ? remaining[0] : null);
            }
            toast.success("Assignment deleted");
        } catch (error) {
            console.error("Error deleting assignment:", error);
            toast.error("Failed to delete assignment");
        } finally {
            setDeleteConfirm({ isOpen: false, type: null, id: null });
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

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
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
                </div>
                <div className="flex flex-wrap gap-3">
                    {meetLink && (
                        <a href={meetLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-200 hover:bg-cyan-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <Video className="w-5 h-5" />Start Class
                        </a>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-8">
                <div className="space-y-6">


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
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedMaterial({ ...lec, isLecture: true })}
                                            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                                        >
                                            View
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirm({ isOpen: true, type: 'lecture', id: lec._id })}
                                            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
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
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Total Points</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={newAssignment.maxPoints}
                                            onChange={(e) => setNewAssignment({ ...newAssignment, maxPoints: e.target.value })}
                                            placeholder="100"
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
                                        {a.title} • {a.maxPoints || 100} pts
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
                                            <span>{selectedAssignment.maxPoints || 100} points</span>
                                            <span>•</span>
                                            <span>{submissions.length} submissions</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirm({ isOpen: true, type: 'assignment', id: selectedAssignment._id })}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
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
                                                            <button
                                                                onClick={() => setPreviewSubmission(s)}
                                                                className="inline-flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-cyan-600 transition-colors"
                                                                title="Preview submission"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-bold">View</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {s.status === 'Graded' ? (
                                                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                    Result: {getSubmissionScore(s) || 0}/{selectedAssignment?.maxPoints || 100}
                                                                </span>
                                                                <button onClick={() => { setGradingSubmission(s); setGradeData({ score: getSubmissionScore(s), feedback: s.feedback }); }} className="text-[10px] font-bold text-cyan-600 hover:underline">Edit</button>
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
                                    <p className="text-xs text-slate-400 mt-1">
                                        Grade out of {selectedAssignment?.maxPoints || 100} points
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission file</p>
                                        <p className="text-xs text-slate-500 truncate">{gradingSubmission.fileName || "student submission"}</p>
                                    </div>
                                    <button
                                        onClick={() => setPreviewSubmission(gradingSubmission)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-cyan-200 hover:text-cyan-700 transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        View
                                    </button>
                                </div>

                                <form onSubmit={handleGradeSubmission} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Score</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={selectedAssignment?.maxPoints || 100}
                                            required
                                            value={gradeData.score}
                                            onChange={(e) => setGradeData({...gradeData, score: e.target.value})}
                                            placeholder={`0 - ${selectedAssignment?.maxPoints || 100}`}
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
                    
                    {/* Delete Confirmation Modal */}
                    {deleteConfirm.isOpen && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-300 text-center">
                                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Confirm Deletion</h3>
                                    <p className="text-sm text-slate-500 mt-2">
                                        {deleteConfirm.type === 'lecture' 
                                            ? "Are you sure you want to delete this lecture note? This action cannot be undone."
                                            : "Are you sure you want to delete this assignment? All associated student submissions will also be permanently deleted."}
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}
                                        className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (deleteConfirm.type === 'lecture') {
                                                executeDeleteLecture(deleteConfirm.id);
                                            } else {
                                                executeDeleteAssignment(deleteConfirm.id);
                                            }
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {previewSubmission && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
                            <div className="w-full max-w-5xl h-[85vh] rounded-[2rem] bg-white shadow-2xl overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview submission</p>
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                            {previewSubmission.fileName || previewSubmission.student?.name || "Submission"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewSubmission(null)}
                                        className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                                <div className="flex-1 relative bg-slate-50">
                                    {previewLoading ? (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                                            Loading preview...
                                        </div>
                                    ) : previewError ? (
                                        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-rose-600 text-sm">
                                            {previewError}
                                        </div>
                                    ) : (
                                        <object
                                            title="Submission preview"
                                            data={previewUrl || undefined}
                                            type="application/pdf"
                                            className="w-full h-full"
                                        >
                                            <div className="p-6 text-center text-slate-500 text-sm">
                                                Your browser can't display this file inline. Use the close button and try again.
                                            </div>
                                        </object>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lecture/Resource Preview Modal */}
                    {selectedMaterial && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-cyan-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 leading-tight">{selectedMaterial.title}</h3>
                                            <p className="text-xs text-slate-500">{selectedMaterial.isLecture ? "Lecture Note" : "Resource"}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedMaterial(null)}
                                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                
                                <div className="flex-1 bg-slate-50 relative overflow-hidden">
                                    {(() => {
                                        const url = selectedMaterial.url || "";
                                        const urlExt = (url.split('?')[0].split('.').pop() || '').toLowerCase();
                                        
                                        // Enhanced detection
                                        const isPdf = urlExt === 'pdf' || 
                                                      (selectedMaterial.fileType || "").toLowerCase() === 'pdf' || 
                                                      url.toLowerCase().includes('.pdf');
                                        const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(urlExt) || 
                                                      ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedMaterial.fileType) ||
                                                      /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url);
                                        const isOffice = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(urlExt) ||
                                                         (selectedMaterial.fileType || "").toLowerCase().includes('presentation') ||
                                                         (selectedMaterial.fileType || "").toLowerCase().includes('wordprocessingml');
                                        
                                        if (isPdf) {
                                            return (
                                                <iframe
                                                    src={`${getApiUrl()}/classrooms/view-note/${classroom._id}/${selectedMaterial._id}/preview.pdf?token=${user?.token}`}
                                                    title={selectedMaterial.title}
                                                    className="w-full h-full border-none bg-white"
                                                />
                                            );
                                        } else if (isImg) {
                                            return (
                                                <div className="w-full h-full flex items-center justify-center p-8 bg-white overflow-auto">
                                                    <img 
                                                        src={`${getApiUrl()}/classrooms/view-note/${classroom._id}/${selectedMaterial._id}?token=${user?.token}`}
                                                        alt={selectedMaterial.title}
                                                        className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                                                    />
                                                </div>
                                            );
                                        } else if (isOffice || url.toLowerCase().includes('.ppt') || url.toLowerCase().includes('.doc') || url.toLowerCase().includes('.xls')) {
                                            const directUrl = url.replace('http://', 'https://');
                                            const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(directUrl)}&embedded=true`;
                                            return (
                                                <iframe
                                                    src={googleUrl}
                                                    title={selectedMaterial.title}
                                                    className="w-full h-full border-none bg-white"
                                                />
                                            );
                                        } else {
                                            return (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white text-center">
                                                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                                        <FileCheck className="w-10 h-10 text-cyan-600" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-900">Preview Not Supported</h4>
                                                    <p className="text-sm text-slate-500 max-w-xs mt-2">
                                                        This file type cannot be previewed directly. 
                                                        You can try opening it in a new tab or downloading it.
                                                    </p>
                                                    <div className="flex gap-4 mt-6">
                                                        <a 
                                                            href={url} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm"
                                                        >
                                                            Open in New Tab
                                                        </a>
                                                        <a 
                                                            href={`${url}${url.includes('?') ? '&' : '?'}download=true`}
                                                            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                                                        >
                                                            Download
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>

                                <div className="p-4 md:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                                    <button
                                        onClick={() => setSelectedMaterial(null)}
                                        className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg"
                                    >
                                        Close Preview
                                    </button>
                                </div>
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
