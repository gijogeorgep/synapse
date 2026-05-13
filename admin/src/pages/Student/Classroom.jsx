import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Video, ExternalLink, BookOpen, ArrowLeft, FileText, Clock, PlayCircle, Award, Download, Upload, Loader2, CheckCircle2, Calendar, X, TrendingUp, ClipboardCheck, Eye } from "lucide-react";
import { getExams, getExamsBySpecificClassroom, getMyResults, getMaterials, getAssignments, submitHomework, uploadFile, getClassroomRank } from "../../api/services";
import { getApiUrl } from "../../api/apiClient";
import { toast } from "react-hot-toast";
// import ClassroomAIChat from "../../components/ClassroomAIChat";

const StudentClassroom = () => {
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const classroom = state?.classroom;

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewSubmission, setPreviewSubmission] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [classroomRank, setClassroomRank] = useState({ rank: 0, totalStudents: 0 });
  const [viewMode, setViewMode] = useState("recent"); // "recent" or "subject"

  useEffect(() => { if (!classroom) navigate("/student/classrooms"); }, [classroom, navigate]);

  const fallbackSubject = classroom?.subjects?.[0] || classroom?.name || "Subject";
  const fallbackClass = classroom?.className || user?.class || "10";
  const classroomId = classroom?._id?.toString?.() || "";
  const teachers = Array.isArray(classroom?.teachers) ? classroom.teachers : [];
  const classmates = Array.isArray(classroom?.students) ? classroom.students : [];
  const lectures = Array.isArray(classroom?.lectureNotes) ? classroom.lectureNotes : [];

  const classroomMaterials = useMemo(() => {
    if (!classroomId) return [];
    return materials.filter((m) => {
      if (!m?.classroom) return false;
      if (typeof m.classroom === "string") return m.classroom === classroomId;
      return (m.classroom?._id?.toString?.() || m.classroom?.toString?.() || "") === classroomId;
    });
  }, [materials, classroomId]);

  const materialsBySubject = useMemo(() => {
    const grouped = {};
    const allItems = [
      ...lectures.map(l => ({ ...l, isLecture: true })),
      ...classroomMaterials.map(m => ({ ...m, isStudyMaterial: true }))
    ];

    allItems.forEach(item => {
      const subject = item.subject || "General";
      if (!grouped[subject]) grouped[subject] = [];
      grouped[subject].push(item);
    });
    return grouped;
  }, [lectures, classroomMaterials]);

  const availableExams = useMemo(() => exams.filter((exam) => !results.some((r) => r.exam?._id === exam._id)), [exams, results]);

  useEffect(() => {
    const load = async () => {
      if (!classroom?._id) { setLoadingExams(false); setLoadingResults(false); return; }
      try {
        const [classroomExams, allExams, rankData] = await Promise.all([
          getExamsBySpecificClassroom(classroom._id),
          getExams(),
          getClassroomRank(classroom._id).catch(() => ({ rank: 0, totalStudents: 0 }))
        ]);
        const merged = new Map();
        (Array.isArray(classroomExams) ? classroomExams : []).forEach((exam) => exam?._id && merged.set(exam._id, exam));
        (Array.isArray(allExams) ? allExams : []).forEach((exam) => {
          const cid = typeof exam?.classroom === "object" ? exam.classroom?._id?.toString() : exam?.classroom?.toString();
          if (exam?._id && cid === classroom._id?.toString()) merged.set(exam._id, exam);
        });
        setExams([...merged.values()]);
        setClassroomRank(rankData);
        const res = await getMyResults();
        setResults(Array.isArray(res) ? res.filter((r) => r.exam?.subject === fallbackSubject) : []);
      } catch (e) { console.error(e); } finally { setLoadingExams(false); setLoadingResults(false); }
    };
    load();
  }, [classroom?._id, fallbackSubject]);

  useEffect(() => {
    if (!classroom?._id) {
      setMaterials([]);
      setMaterialsLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      setMaterialsLoading(true);
      try {
        const data = await getMaterials();
        if (mounted) setMaterials(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setMaterialsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [classroom?._id]);

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
          },
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Preview failed (${response.status})`);
        }

        const contentType = response.headers.get("content-type") || "application/pdf";
        const blob = new Blob([await response.arrayBuffer()], { type: contentType });
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

  useEffect(() => {
    if (previewUrl && previewSubmission) {
      const isPdf = previewSubmission.fileName?.toLowerCase().endsWith(".pdf") ||
        (previewSubmission.fileUrl || "").toLowerCase().includes(".pdf");
      setSelectedMaterial({
        title: previewSubmission.fileName || "Submission Preview",
        fileUrl: previewUrl,
        isSubmission: true,
        isPdf: isPdf
      });
    }
  }, [previewUrl, previewSubmission]);

  useEffect(() => {
    const load = async () => {
      if (!classroom?._id) return;
      try { setLoadingAssignments(true); const data = await getAssignments(classroom._id); setAssignments(Array.isArray(data) ? data : []); }
      catch (e) { console.error(e); }
      finally { setLoadingAssignments(false); }
    };
    load();
  }, [classroom?._id]);
  const openSubmitModal = (assignment) => { setSelectedAssignment(assignment); setSelectedFile(null); setIsSubmitModalOpen(true); };
  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return toast.error("Only PDF, JPG, and PNG files are allowed.");
    if (file.size > 5 * 1024 * 1024) return toast.error("File size should be less than 5MB.");
    setSelectedFile(file);
  };
  const handleSubmitHomework = async (e) => {
    e.preventDefault(); if (!selectedFile || !selectedAssignment) return;
    try {
      setSubmitting(true);
      const formData = new FormData(); formData.append("file", selectedFile);
      const uploadData = await uploadFile(formData);
      await submitHomework(selectedAssignment._id, { fileUrl: uploadData.url, fileName: selectedFile.name });
      const updated = await getAssignments(classroom._id); setAssignments(Array.isArray(updated) ? updated : []);
      toast.success("Homework submitted successfully! 🎉"); setIsSubmitModalOpen(false); setSelectedAssignment(null); setSelectedFile(null);
    } catch (e) { console.error(e); toast.error(e?.message || "Failed to submit homework."); }
    finally { setSubmitting(false); }
  };

  const stats = useMemo(() => {
    const attended = results.length;
    const totalScore = results.reduce((acc, r) => acc + (r.exam ? (r.score / r.exam.duration) * 100 : 0), 0);
    const avg = attended > 0 ? Math.round(totalScore / attended) : 0;
    const rankStr = classroomRank.rank > 0 ? `# ${classroomRank.rank}` : "# -";
    const totalStr = classroomRank.totalStudents > 0 ? `out of ${classroomRank.totalStudents}` : "students";
    return { attended, avg, rank: rankStr, total: totalStr };
  }, [results, classroomRank]);

  if (!classroom) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-cyan-700"><ArrowLeft className="w-4 h-4" />Back to dashboard</button>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-cyan-600 uppercase tracking-[0.16em] mb-1">Online classroom</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{classroom?.name || fallbackSubject}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 text-xs font-bold uppercase tracking-wider">Class {fallbackClass}</span>
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">{classroom?.board || "Board"}</span>
            {classroom?.subjects?.slice(0, 2).map((sub) => <span key={sub} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">{sub}</span>)}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/student/lesson-tracker")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-700 font-bold border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all"
          >
            <FileText className="w-5 h-5 text-cyan-600" />
            Lesson History
          </button>
          {classroom?.onlineClassLink && (
            <a href={classroom.onlineClassLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-200 hover:bg-cyan-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Video className="w-5 h-5" />Join Class
            </a>
          )}
        </div>
      </header>

      {/* Classroom stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            label: "Rank in Class",
            value: stats.rank,
            icon: TrendingUp,
            tone: "bg-amber-50 text-amber-700 border-amber-100",
            desc: stats.total
          },
          {
            label: "Average Score",
            value: `${stats.avg}%`,
            icon: Award,
            tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
            desc: "Based on all exams in this class"
          },
          {
            label: "Exams Attended",
            value: String(stats.attended),
            icon: ClipboardCheck,
            tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
            desc: "Completed assessments"
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
              <p className="mt-1 text-[10px] font-medium text-slate-400">{stat.desc}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${stat.tone}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-8">
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-600" />Study materials & resources</h2>
              <p className="text-sm text-slate-500">View lecture notes and other study materials shared by your teachers.</p>
            </div>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewMode("recent")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === "recent" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Recent
              </button>
              <button
                onClick={() => setViewMode("subject")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === "subject" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Subject-wise
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {materialsLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            ) : (classroomMaterials.length > 0 || lectures.length > 0) ? (
              <div className="space-y-6">
                {viewMode === "recent" ? (
                  <div className="grid grid-cols-1 gap-4">
                    {/* Priority 1: Direct Lecture Notes from Teachers */}
                    {lectures.map((lecture, index) => (
                      <div key={`lecture-${lecture._id || index}`} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/30 transition-all shadow-sm group">
                        <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedMaterial({ ...lecture, isLecture: true, _id: lecture._id || lecture.id })}>
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate group-hover:text-cyan-700 transition-colors">{lecture.title}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{lecture.subject || "Lecture Note"} • {lecture.createdAt ? new Date(lecture.createdAt).toLocaleDateString() : "Recent"}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedMaterial({ ...lecture, isLecture: true, _id: lecture._id || lecture.id })}
                          className="px-4 py-2 rounded-xl bg-slate-50 text-cyan-700 text-xs font-bold hover:bg-cyan-600 hover:text-white transition-all border border-cyan-100"
                        >
                          View
                        </button>
                      </div>
                    ))}

                    {/* Priority 2: Matching Study Materials from Library */}
                    {classroomMaterials.map((material) => {
                      return (
                        <div key={`material-${material._id}`} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/30 transition-all shadow-sm group">
                          <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedMaterial(material)}>
                            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0 group-hover:bg-cyan-100 transition-colors">
                              <BookOpen className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate group-hover:text-cyan-700 transition-colors">{material.title}</p>
                              <p className="text-[11px] text-slate-500 font-medium">{material.subject || "Study Material"} • {(material.fileType || "Resource").toUpperCase()}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedMaterial(material)}
                            className="px-4 py-2 rounded-xl bg-slate-50 text-cyan-700 text-xs font-bold hover:bg-cyan-600 hover:text-white transition-all border border-cyan-100"
                          >
                            View
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(materialsBySubject).map(([subject, items]) => (
                      <div key={subject} className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{subject}</h3>
                          <span className="text-[10px] text-slate-400 font-bold ml-auto">{items.length} materials</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-cyan-200 hover:bg-white transition-all group">
                              <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedMaterial(item.isLecture ? { ...item, isLecture: true, _id: item._id || item.id } : item)}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${item.isLecture ? "bg-indigo-50 text-indigo-600" : "bg-cyan-50 text-cyan-600"}`}>
                                  {item.isLecture ? <FileText className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-cyan-700 transition-colors">{item.title}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">{item.isLecture ? "Lecture Note" : (item.fileType || "Resource").toUpperCase()}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedMaterial(item.isLecture ? { ...item, isLecture: true, _id: item._id || item.id } : item)}
                                className="p-2 rounded-lg bg-white text-cyan-700 border border-slate-200 hover:bg-cyan-600 hover:text-white transition-all shadow-sm"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400">No classroom materials yet. Check back soon!</p>
              </div>
            )}
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-600" />Upcoming & active exams</h3><span className="text-xs font-medium text-slate-400">{availableExams?.length || 0} exams</span></div>
            <div className="space-y-3">{loadingExams ? <div className="text-center py-4 text-slate-400 text-sm">Loading exams...</div> : availableExams.length === 0 ? <div className="text-center py-4 text-slate-400 text-sm">No exams scheduled for this subject.</div> : availableExams.map((exam) => <div key={exam._id} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-100 transition-colors"><div className="space-y-1"><p className="text-sm font-semibold text-slate-900">{exam.title}</p><p className="text-xs text-slate-500 flex items-center gap-2"><Clock className="w-3 h-3" />{exam.duration} mins • {exam.isActive ? "Active" : "Archived"}</p></div><button onClick={() => navigate("/student/exams", { state: { startExamId: exam._id } })} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-cyan-600 text-white text-xs font-semibold shadow-sm hover:bg-cyan-700 transition-colors"><PlayCircle className="w-4 h-4" /><span>Take exam</span></button></div>)}</div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><BookOpen className="w-4 h-4 text-cyan-600" />Assignments & classwork</h3><span className="text-xs font-medium text-slate-400">{assignments?.length || 0} items</span></div>
            <div className="space-y-4">{loadingAssignments ? <div className="text-center py-4 text-slate-400 text-sm">Loading assignments...</div> : assignments.length === 0 ? <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-100"><p className="text-sm text-slate-400">No assignments posted for this classroom.</p></div> : assignments.map((work) => { const submission = work.userSubmission; const isSubmitted = !!submission; const isGraded = submission?.status === "Graded"; const attachment = Array.isArray(work.attachments) ? work.attachments[0] : null; return <div key={work._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3"><div className="flex items-start justify-between gap-4"><div className="space-y-1"><p className="text-sm font-bold text-slate-900">{work.title}</p><p className="text-xs text-slate-500 flex items-center gap-1.5"><Calendar className="w-3 h-3" />Due {new Date(work.dueDate).toLocaleDateString()}</p>{typeof work.maxPoints === "number" && <p className="text-[11px] text-slate-400 font-semibold">{work.maxPoints} points</p>}</div><div className="flex items-center gap-2">{isGraded ? <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isGraded ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>{isGraded ? "Graded" : "Submitted"}</span> : <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">Pending</span>}{attachment && <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedMaterial({ title: work.title + " - Attachment", fileUrl: attachment.url, isAttachment: true }); }} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[11px] font-semibold text-cyan-700 border border-cyan-100 hover:bg-cyan-50 transition-colors"><ExternalLink className="w-3.5 h-3.5" /><span>View work</span></button>}</div></div>{work.description && <p className="text-xs text-slate-600 line-clamp-2">{work.description}</p>}<div className="flex items-center justify-between pt-1"><div className="flex items-center gap-2">{isGraded && <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-emerald-100 shadow-sm"><Award className="w-3.5 h-3.5 text-emerald-600" /><span className="text-xs font-bold text-emerald-700">Result: {submission.grade}</span></div>}</div>{!isSubmitted ? <button type="button" onClick={() => openSubmitModal(work)} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-all shadow-sm"><PlayCircle className="w-3.5 h-3.5" /><span>Submit Homework</span></button> : <div className="flex items-center gap-2"><button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewSubmission(submission); }} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"><ExternalLink className="w-3.5 h-3.5" /><span>View submission</span></button>{!isGraded && <button type="button" onClick={() => openSubmitModal(work)} className="p-2 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors" title="Update Submission"><PlayCircle className="w-3.5 h-3.5" /></button>}</div>}</div>{isGraded && submission.feedback && <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-50 text-[11px] text-emerald-800 italic"><strong>Teacher's feedback:</strong> "{submission.feedback}"</div>}</div>; })}</div>
          </div>
        </section>

        <aside className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
          <div className="space-y-2"><h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-600" />Class overview</h3><p className="text-sm text-slate-500">One place for all your MCQ tests, assignments, and study materials for this subject.</p><ul className="mt-1 text-sm text-slate-600 space-y-1 list-disc list-inside"><li>Take MCQ tests and download resources</li><li>Access study materials shared by your tutor</li></ul></div>
          <div className="border-t border-slate-100 pt-4 space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">Teachers</h4>
                <span className="text-xs text-slate-400">{teachers.length} {teachers.length === 1 ? "teacher" : "teachers"}</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {teachers.length === 0 ? (
                  <div className="text-xs text-slate-400 py-2">No teachers assigned</div>
                ) : (
                  teachers.map((teacher) => (
                    <div key={teacher._id || teacher.id || teacher.email || teacher.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 overflow-hidden shrink-0">
                        {teacher.avatarUrl ? <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" /> : (teacher.name?.[0] || "?").toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-slate-800 font-medium truncate">{teacher.name || "Assigned Teacher"}</span>
                        <span className="text-[11px] text-slate-400 truncate">{teacher.email || "Teacher"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">Classmates</h4>
                <span className="text-xs text-slate-400">{classmates.length} students</span>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {classmates.length === 0 ? (
                  <div className="text-xs text-slate-400 py-2">No classmates enrolled yet</div>
                ) : (
                  classmates.map((mate) => {
                    const isMe = user?.email && mate?.email && user.email.toLowerCase() === mate.email.toLowerCase();
                    return (
                      <div key={mate._id || mate.id || mate.email || mate.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700 overflow-hidden shrink-0">
                          {mate.avatarUrl ? <img src={mate.avatarUrl} alt={mate.name} className="w-full h-full object-cover" /> : (mate.initial || mate.name?.[0] || "?").toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-800 font-medium truncate">{mate.name || "Student"}</span>
                            {isMe && <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-white">You</span>}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate">{mate.email || "Student"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="space-y-3"><div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-slate-900">Exams</h4><span className="text-xs text-slate-400">{exams.length}</span></div><div className="space-y-2 max-h-44 overflow-y-auto pr-1">{loadingExams ? <div className="flex items-center justify-center py-4 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div> : exams.length > 0 ? exams.map((exam) => <div key={exam._id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all hover:border-cyan-200 hover:bg-cyan-50/50"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-medium text-slate-900 truncate">{exam.title}</p><p className="mt-1 text-xs text-slate-500">{exam.subject} • {exam.duration} mins</p></div><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-200">{exam.examCategory || "scheduled"}</span></div><p className="mt-2 text-xs text-slate-500">{exam.date ? new Date(exam.date).toLocaleDateString() : "Scheduled soon"}</p></div>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center"><p className="text-sm text-slate-500">No exams scheduled yet.</p></div>}</div></div>
          </div>
        </aside>
      </div>
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 md:p-10 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4"><Upload className="w-8 h-8" /></div>
              <h3 className="text-2xl font-black text-slate-900">Submit Homework</h3>
              <p className="text-slate-500 text-sm mt-2">Uploading for: <span className="font-bold text-slate-700">{selectedAssignment?.title}</span></p>
            </div>
            <form onSubmit={handleSubmitHomework} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Upload Document or Image</label>
                <div className="relative group">
                  <input type="file" accept="application/pdf,image/jpeg,image/jpg,image/png" onChange={handleFileChange} className="hidden" id="homework-file" />
                  <label htmlFor="homework-file" className={`flex flex-col items-center justify-center w-full h-32 px-4 bg-slate-50 border-2 border-dashed rounded-[2rem] cursor-pointer group-hover:bg-slate-100 transition-all ${selectedFile ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 group-hover:border-indigo-300"}`}>
                    <div className="flex flex-col items-center justify-center py-6">{selectedFile ? <><CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" /><p className="text-xs font-bold text-emerald-700 truncate max-w-[200px]">{selectedFile.name}</p><p className="text-[10px] text-emerald-600/60 mt-1 uppercase font-black">Ready to submit</p></> : <><FileText className="w-8 h-8 text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors" /><p className="text-xs font-bold text-slate-600">Click to browse</p><p className="text-[10px] text-slate-400 mt-1">PDF, JPG or PNG (Max 5MB)</p></>}</div>
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setIsSubmitModalOpen(false); setSelectedAssignment(null); setSelectedFile(null); }} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || !selectedFile} className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">{submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Submit File"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Submission Preview - Reusing the same logic but triggering unified modal */}
      {previewLoading && !selectedMaterial && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-600" />
            <p className="text-sm font-bold text-slate-700">Loading submission preview...</p>
          </div>
        </div>
      )}

      {/* Material/Lecture Preview Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          {(() => {
            const previewUrl = selectedMaterial.isLecture
              ? `${getApiUrl()}/classrooms/view-note/${classroom?._id}/${selectedMaterial._id}?token=${user?.token}`
              : (selectedMaterial.isAttachment || selectedMaterial.isSubmission)
                ? selectedMaterial.fileUrl
                : `${getApiUrl()}/materials/view/${selectedMaterial._id}/preview.pdf?token=${user?.token}`;
            console.warn("[DEBUG_PREVIEW] Selected Material:", selectedMaterial);
            console.warn("[DEBUG_PREVIEW] Generated URL:", previewUrl);
            return null;
          })()}
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{selectedMaterial.title}</h3>
                  <p className="text-xs text-slate-500">{selectedMaterial.isLecture ? "Lecture Note" : selectedMaterial.isSubmission ? "Assignment Submission" : selectedMaterial.isAttachment ? "Attachment" : (selectedMaterial.subject || fallbackSubject)}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedMaterial(null); setPreviewSubmission(null); }}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 bg-slate-50 relative overflow-hidden">
              {(() => {
                const url = selectedMaterial.fileUrl || selectedMaterial.url || "";
                const urlExt = (url.split('?')[0].split('.').pop() || '').toLowerCase();

                // Enhanced detection logic
                const isPdf = urlExt === 'pdf' ||
                  (selectedMaterial.fileType || "").toLowerCase() === 'pdf' ||
                  (selectedMaterial.isPdf) ||
                  url.toLowerCase().includes('.pdf');

                const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(urlExt) ||
                  ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedMaterial.fileType) ||
                  (!isPdf && selectedMaterial.isSubmission) ||
                  /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url);

                const isOffice = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(urlExt) ||
                  (selectedMaterial.fileType || "").toLowerCase().includes('presentation') ||
                  (selectedMaterial.fileType || "").toLowerCase().includes('wordprocessingml');

                if (isPdf) {
                  const previewUrl = selectedMaterial.isLecture
                    ? `${getApiUrl()}/classrooms/view-note/${classroom?._id}/${selectedMaterial._id}/preview.pdf?token=${user?.token}`
                    : (selectedMaterial.isAttachment || selectedMaterial.isSubmission)
                      ? url
                      : `${getApiUrl()}/materials/view/${selectedMaterial._id}/preview.pdf?token=${user?.token}`;

                  return (
                    <div className="w-full h-full bg-white relative">
                      <iframe
                        src={previewUrl}
                        title={selectedMaterial.title}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    </div>
                  );
                }

                if (isImg) {
                  return (
                    <div className="w-full h-full flex items-center justify-center p-6 bg-white overflow-auto">
                      <img
                        src={url}
                        alt={selectedMaterial.title}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                      />
                    </div>
                  );
                }

                if (isOffice || url.toLowerCase().includes('.ppt') || url.toLowerCase().includes('.doc') || url.toLowerCase().includes('.xls')) {
                  const directUrl = url.replace('http://', 'https://');
                  const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(directUrl)}&embedded=true`;
                  return (
                    <iframe
                      src={googleUrl}
                      title={selectedMaterial.title}
                      className="w-full h-full border-none bg-white"
                    />
                  );
                }

                return (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                      <BookOpen className="w-10 h-10 text-cyan-600" />
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
              })()}
            </div>

            <div className="p-4 md:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
              <button
                onClick={() => { setSelectedMaterial(null); setPreviewSubmission(null); }}
                className="px-8 py-3 rounded-2xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-colors shadow-md"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* <ClassroomAIChat /> */}
    </div>
  );
};

export default StudentClassroom;
