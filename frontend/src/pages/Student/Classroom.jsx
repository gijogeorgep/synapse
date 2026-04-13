import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Video, ExternalLink, BookOpen, ArrowLeft, FileText, Clock, PlayCircle, Award, Download } from "lucide-react";
import { 
    getExams, 
    getExamsBySpecificClassroom, 
    getMyResults, 
    getMaterials, 
    getAssignments, 
    submitHomework, 
    uploadImage 
} from "../../api/services";
import ClassroomAIChat from "../../components/ClassroomAIChat";

const StudentClassroom = () => {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [results, setResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(true);
    const [materials, setMaterials] = useState([]);
    const [materialsLoading, setMaterialsLoading] = useState(true);

    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);
    const [uploading, setUploading] = useState(false);
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
    const availableExams = exams.filter((exam) => !results.some((result) => result.exam?._id === exam._id));
    const classroomId = classroom?._id?.toString?.() || "";
    const classroomMaterials = useMemo(() => {
        if (!classroomId) return [];
        return materials.filter((material) => {
            if (!material?.classroom) return false;
            if (typeof material.classroom === "string") {
                return material.classroom === classroomId;
            }
            const idValue =
                material.classroom?._id?.toString?.() ||
                material.classroom?.toString?.() ||
                "";
            return idValue === classroomId;
        });
    }, [materials, classroomId]);

    useEffect(() => {
        const fetchExams = async () => {
            if (!classroom?._id) {
                setLoadingExams(false);
                return;
            }
            try {
                const [classroomExamData, allExamData] = await Promise.all([
                    getExamsBySpecificClassroom(classroom._id),
                    getExams()
                ]);

                const normalizedClassroomId = classroom._id?.toString();
                const mergedExams = new Map();

                (Array.isArray(classroomExamData) ? classroomExamData : []).forEach((exam) => {
                    if (exam?._id) {
                        mergedExams.set(exam._id, exam);
                    }
                });

                (Array.isArray(allExamData) ? allExamData : []).forEach((exam) => {
                    const examClassroomId =
                        typeof exam?.classroom === "object"
                            ? exam.classroom?._id?.toString()
                            : exam?.classroom?.toString();

                    if (exam?._id && examClassroomId === normalizedClassroomId) {
                        mergedExams.set(exam._id, exam);
                    }
                });

                setExams(Array.from(mergedExams.values()));
            } catch (error) {
                console.error("Error fetching exams:", error);
            } finally {
                setLoadingExams(false);
            }
        };
        const fetchResults = async () => {
            try {
                const data = await getMyResults();
                // Filter results for this specific subject - with defensive check
                const subjectResults = Array.isArray(data) 
                    ? data.filter(r => r.exam?.subject === fallbackSubject)
                    : [];
                setResults(subjectResults);
            } catch (error) {
                console.error("Error fetching results:", error);
            } finally {
                setLoadingResults(false);
            }
        };
        fetchExams();
        fetchResults();
    }, [fallbackSubject, fallbackClass, classroom?._id]);

    useEffect(() => {
        if (!classroom?._id) {
            setMaterials([]);
            setMaterialsLoading(false);
            return;
        }

        let isMounted = true;
        const fetchClassMaterials = async () => {
            setMaterialsLoading(true);
            try {
                const data = await getMaterials();
                if (isMounted) {
                    setMaterials(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error fetching classroom materials:", error);
            } finally {
                if (isMounted) {
                    setMaterialsLoading(false);
                }
            }
        };

        fetchClassMaterials();
        return () => {
            isMounted = false;
        };
    }, [classroom?._id]);

    const link =
        classroom?.onlineClassLink ||
        "https://meet.google.com/example-class-link";

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!classroom?._id) return;
            try {
                setLoadingAssignments(true);
                const data = await getAssignments(classroom._id);
                setAssignments(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching assignments:", error);
            } finally {
                setLoadingAssignments(false);
            }
        };
        fetchAssignments();
    }, [classroom?._id]);

    const handleAssignmentSubmit = async (assignmentId, e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setSubmittingId(assignmentId);
            setUploading(true);

            // 1. Upload file
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadRes = await uploadImage(formData); 

            // 2. Submit record
            const submissionData = {
                fileUrl: uploadRes.url,
                fileName: file.name
            };

            await submitHomework(assignmentId, submissionData);
            
            // 3. Refresh assignments
            const data = await getAssignments(classroom._id);
            setAssignments(data);
            
            alert("Assignment submitted successfully!");
        } catch (error) {
            console.error("Error submitting assignment:", error);
            alert("Failed to submit assignment. Please try again.");
        } finally {
            setSubmittingId(null);
            setUploading(false);
        }
    };

    const lectures = classroom?.lectureNotes || [];

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

                {classroom?.onlineClassLink && (
                    <a
                        href={classroom.onlineClassLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-200 hover:bg-cyan-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Video className="w-5 h-5" />
                        Join Class
                    </a>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-8">
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Study materials & resources
                    </h2>
                    <p className="text-sm text-slate-500">
                        View lecture notes and other study materials shared by your teachers.
                    </p>

                    <div className="space-y-3">
                        {materialsLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-10 h-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin"></div>
                            </div>
                        ) : classroomMaterials.length > 0 ? (
                            classroomMaterials.map((material) => {
                                const isPdf =
                                    material.fileType?.toLowerCase() === "pdf" ||
                                    (material.fileUrl || "").toLowerCase().includes(".pdf");
                                const previewUrl =
                                    isPdf && material._id
                                        ? `/api/materials/view/${material._id}/preview.pdf`
                                        : material.fileUrl || "#";
                                const downloadUrl =
                                    isPdf && material._id
                                        ? `/api/materials/view/${material._id}?download=true`
                                        : material.fileUrl
                                            ? material.fileUrl.replace("/upload/", "/upload/fl_attachment/")
                                            : "#";

                                return (
                                    <div
                                        key={material._id}
                                        className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 hover:bg-cyan-50/70 border border-slate-100 hover:border-cyan-100 transition-colors"
                                    >
                                        <div className="space-y-2 max-w-[65%]">
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {material.title}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {(material.subject || fallbackSubject)} •{" "}
                                                {(material.fileType || "Resource").toUpperCase()}
                                                {material.createdAt
                                                    ? ` • Uploaded ${new Date(material.createdAt).toLocaleDateString()}`
                                                    : ""}
                                            </p>
                                            {material.description && (
                                                <p className="text-xs text-slate-400 truncate">
                                                    {material.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <a
                                                href={previewUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-xs font-semibold text-slate-700 border border-slate-200 hover:border-cyan-300 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                <span>Preview</span>
                                            </a>
                                            <a
                                                href={downloadUrl}
                                                download
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-600 text-white text-xs font-semibold shadow-sm hover:bg-cyan-500 transition-colors"
                                            >
                                                <Download className="w-3 h-3" />
                                                <span>Download</span>
                                            </a>
                                        </div>
                                    </div>
                                );
                            })
                        ) : lectures && lectures.length > 0 ? (
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
                                            {lecture.createdAt ? new Date(lecture.createdAt).toLocaleDateString() : "Recent"}
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
                            <div className="text-center py-4 text-slate-400 text-sm">
                                No classroom materials yet. Check the Student Library tab or ask your tutor to upload resources.
                            </div>
                        )}
                    </div>

                    <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                Upcoming & active exams
                            </h3>
                            <span className="text-xs font-medium text-slate-400">
                                {availableExams?.length || 0} exams
                            </span>
                        </div>

                        <div className="space-y-3">
                            {loadingExams ? (
                                <div className="text-center py-4 text-slate-400 text-sm">Loading exams...</div>
                            ) : availableExams.length === 0 ? (
                                <div className="text-center py-4 text-slate-400 text-sm">No exams scheduled for this subject.</div>
                            ) : (
                                availableExams.map((exam) => {
                                    return (
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
                                    );
                                })
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

                        <div className="space-y-4">
                            {loadingAssignments ? (
                                <div className="text-center py-4 text-slate-400 text-sm">Loading assignments...</div>
                            ) : assignments.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-100">
                                    <p className="text-sm text-slate-400">No assignments posted for this classroom.</p>
                                </div>
                            ) : (
                                assignments.map((work) => {
                                    const submission = work.userSubmission;
                                    const isSubmitted = !!submission;
                                    const isGraded = submission?.status === 'Graded';

                                    return (
                                        <div
                                            key={work._id}
                                            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {work.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Due {new Date(work.dueDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isSubmitted ? (
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                isGraded
                                                                    ? "bg-emerald-100 text-emerald-700"
                                                                    : "bg-indigo-100 text-indigo-700"
                                                            }`}
                                                        >
                                                            {isGraded ? "Graded" : "Submitted"}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {work.description && (
                                                <p className="text-xs text-slate-600 line-clamp-2">{work.description}</p>
                                            )}

                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center gap-2">
                                                    {isGraded && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-emerald-100 shadow-sm">
                                                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span className="text-xs font-bold text-emerald-700">Result: {submission.grade}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {!isSubmitted ? (
                                                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-all cursor-pointer shadow-sm">
                                                        {submittingId === work._id ? (
                                                            <Clock className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <PlayCircle className="w-3.5 h-3.5" />
                                                        )}
                                                        <span>{submittingId === work._id ? "Uploading..." : "Submit Homework"}</span>
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            disabled={uploading}
                                                            onChange={(e) => handleAssignmentSubmit(work._id, e)}
                                                        />
                                                    </label>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={submission.fileUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            <span>My Submission</span>
                                                        </a>
                                                        {!isGraded && (
                                                            <label className="p-2 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors cursor-pointer" title="Update Submission">
                                                                <PlayCircle className="w-3.5 h-3.5" />
                                                                <input 
                                                                    type="file" 
                                                                    className="hidden" 
                                                                    disabled={uploading}
                                                                    onChange={(e) => handleAssignmentSubmit(work._id, e)}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {isGraded && submission.feedback && (
                                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-50 text-[11px] text-emerald-800 italic">
                                                    <strong>Teacher's feedback:</strong> "{submission.feedback}"
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
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
                            One place for all your MCQ tests, assignments, and study materials for this subject.
                        </p>
                        <ul className="mt-1 text-sm text-slate-600 space-y-1 list-disc list-inside">
                            <li>Take MCQ tests and download resources</li>
                            <li>Access study materials shared by your tutor</li>
                        </ul>
                    </div>

                    {!["NEET", "JEE", "PSC"].includes(classroom?.type) && (
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
                    )}
                </aside>
            </div>
            <ClassroomAIChat />
        </div>
    );
};

export default StudentClassroom;
