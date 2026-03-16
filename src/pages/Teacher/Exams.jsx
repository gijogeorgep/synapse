import { useState, useEffect } from "react";
import {
    GraduationCap,
    PlusCircle,
    FileText,
    Trash2,
    ChevronLeft,
    Clock,
    Plus,
    CheckCircle2,
    X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getExamsByClassroom, createBulkExam, deleteExam, getExamDetails } from "../../api/services";

const Exams = () => {
    const { user } = useAuth();
    const [view, setView] = useState("selection"); // 'selection' or 'classroom'
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsTab, setDetailsTab] = useState("questions"); // 'questions' | 'results'
    const [selectedExamDetails, setSelectedExamDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration: 30,
        examType: "subject-wise",
        questions: [
            { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
        ],
    });

    const teacherSubjects =
        user?.teacherSubjects || user?.subjects || ["Physics", "Chemistry", "Mathematics"];
    const classLevel = user?.classLevel || "10";

    const fetchExams = async (subject) => {
        setLoading(true);
        try {
            const data = await getExamsByClassroom(subject, classLevel);
            setExams(data);
        } catch (error) {
            console.error("Error fetching exams:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectClassroom = (subject) => {
        setSelectedClassroom(subject);
        fetchExams(subject);
        setView("classroom");
    };

    const handleBack = () => {
        setView("selection");
        setSelectedClassroom(null);
        setExams([]);
    };

    const handleAddQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
            ],
        });
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleQuestionUpdate = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleOptionUpdate = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            await createBulkExam({
                ...formData,
                subject: selectedClassroom,
                classLevel: classLevel,
            });
            setShowCreateModal(false);
            setFormData({
                title: "",
                description: "",
                duration: 30,
                questions: [
                    { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
                ],
            });
            fetchExams(selectedClassroom);
        } catch (error) {
            alert(error);
        }
    };

    const handleViewDetails = async (examId) => {
        setLoadingDetails(true);
        setShowDetailsModal(true);
        try {
            const data = await getExamDetails(examId);
            setSelectedExamDetails(data);
        } catch (error) {
            console.error("Error fetching exam details:", error);
            alert("Could not load exam details.");
            setShowDetailsModal(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm("Are you sure you want to delete this exam? This action cannot be undone.")) return;

        try {
            await deleteExam(examId);
            fetchExams(selectedClassroom);
        } catch (error) {
            alert("Error deleting exam: " + error);
        }
    };

    if (view === "selection") {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <header>
                    <div className="flex items-center space-x-2 text-cyan-600 font-bold tracking-wide uppercase text-xs mb-2">
                        <FileText className="w-4 h-4" />
                        <span>Exam Management</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Select a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Classroom</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Choose a subject to manage or create exams for your students.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {teacherSubjects.map((subject) => (
                        <button
                            key={subject}
                            onClick={() => handleSelectClassroom(subject)}
                            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-cyan-200 hover:bg-cyan-50/30 transition-all text-left group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center mb-6 group-hover:bg-cyan-200 transition-colors">
                                <GraduationCap className="w-7 h-7 text-cyan-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{subject}</h3>
                            <p className="text-slate-500 font-medium">Class {classLevel}</p>
                            <div className="mt-6 flex items-center text-cyan-600 font-semibold group-hover:translate-x-1 transition-transform">
                                <span>Manage Exams</span>
                                <Plus className="w-4 h-4 ml-2" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <button
                        onClick={handleBack}
                        className="flex items-center text-slate-500 hover:text-cyan-600 font-semibold mb-4 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Selection
                    </button>
                    <div className="flex items-center space-x-2 text-cyan-600 font-bold tracking-wide uppercase text-xs mb-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>{selectedClassroom} - Class {classLevel}</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Exams</span>
                    </h1>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 px-6 py-3 rounded-full bg-cyan-600 text-white font-bold shadow-lg hover:bg-cyan-700 hover:scale-105 transition-all"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Create Exam</span>
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : exams.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">No exams yet</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                        Create your first exam for this classroom to start evaluating your students.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam) => (
                        <div
                            key={exam._id}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-cyan-100 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-cyan-50 rounded-2xl">
                                    <FileText className="w-6 h-6 text-cyan-600" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${exam.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                        {exam.isActive ? 'Active' : 'Archived'}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteExam(exam._id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">
                                {exam.title}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">
                                {exam.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-slate-500 font-bold">
                                    <Clock className="w-4 h-4 mr-2 text-cyan-600" />
                                    {exam.duration} mins
                                </div>
                                <button
                                    onClick={() => handleViewDetails(exam._id)}
                                    className="px-4 py-2 rounded-xl text-cyan-600 font-black hover:bg-cyan-50 transition-all"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Exam Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Create New Exam</h2>
                                <p className="text-slate-500 text-sm">{selectedClassroom} - Class {classLevel}</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-white rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateExam} className="overflow-y-auto p-8 flex-1 space-y-8">
                            {/* Basic Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Exam Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-cyan-50 focus:border-cyan-200 outline-none transition-all"
                                        placeholder="Half Yearly Exam - Chapter 1 & 2"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Duration (Minutes)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-cyan-50 focus:border-cyan-200 outline-none transition-all"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Description</label>
                                    <textarea
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-cyan-50 focus:border-cyan-200 outline-none transition-all h-24 resize-none"
                                        placeholder="Enter instructions for students..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Questions Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-900">Questions</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="flex items-center text-cyan-600 font-bold hover:text-cyan-700"
                                    >
                                        <Plus className="w-5 h-5 mr-1" />
                                        Add Question
                                    </button>
                                </div>

                                {formData.questions.map((q, qIndex) => (
                                    <div key={qIndex} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {qIndex + 1}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-white focus:ring-4 focus:ring-cyan-50 focus:border-cyan-200 outline-none transition-all"
                                                    placeholder="Enter your question here..."
                                                    value={q.questionText}
                                                    onChange={(e) => handleQuestionUpdate(qIndex, "questionText", e.target.value)}
                                                />
                                            </div>
                                            {formData.questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveQuestion(qIndex)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((option, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuestionUpdate(qIndex, "correctAnswer", oIndex)}
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${q.correctAnswer === oIndex ? 'bg-emerald-500 border-emerald-500 shadow-sm' : 'border-slate-200 hover:border-emerald-300'}`}
                                                    >
                                                        {q.correctAnswer === oIndex && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                    </button>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="flex-1 px-4 py-2 rounded-xl border border-slate-100 bg-white focus:border-cyan-200 outline-none transition-all text-sm"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        value={option}
                                                        onChange={(e) => handleOptionUpdate(qIndex, oIndex, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </form>

                        <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-6 py-3 rounded-full text-slate-600 font-bold hover:bg-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateExam}
                                className="px-10 py-3 rounded-full bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 hover:scale-105 transition-all"
                            >
                                Create & Publish
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Exam Details Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Exam Details</h2>
                                <div className="flex items-center gap-4 mt-2">
                                    <p className="text-slate-500 text-sm">Review questions or track student performance.</p>
                                    <div className="flex items-center p-1 bg-slate-100 rounded-xl w-fit">
                                        <button
                                            onClick={() => setDetailsTab("questions")}
                                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${detailsTab === "questions" ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Questions
                                        </button>
                                        <button
                                            onClick={() => setDetailsTab("results")}
                                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${detailsTab === "results" ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Results
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowDetailsModal(false); setSelectedExamDetails(null); setDetailsTab("questions"); }}
                                className="p-2 hover:bg-white rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-8 flex-1 space-y-8">
                            {loadingDetails ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : selectedExamDetails ? (
                                <div className="space-y-8">
                                    {detailsTab === "questions" ? (
                                        <div className="space-y-8 animate-in fade-in duration-300">
                                            {/* Exam Summary */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Title</p>
                                                    <p className="text-slate-900 font-bold">{selectedExamDetails.title}</p>
                                                </div>
                                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                                                    <p className="text-slate-900 font-bold">{selectedExamDetails.duration} Minutes</p>
                                                </div>
                                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Questions</p>
                                                    <p className="text-slate-900 font-bold">{selectedExamDetails.questions?.length || 0}</p>
                                                </div>
                                            </div>

                                            {/* Questions List */}
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-black text-slate-900">Question Bank</h3>
                                                <div className="space-y-4">
                                                    {selectedExamDetails.questions?.map((q, idx) => (
                                                        <div key={idx} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/20 space-y-4">
                                                            <div className="flex items-start gap-4">
                                                                <span className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-black flex-shrink-0">{idx + 1}</span>
                                                                <p className="text-lg font-bold text-slate-900 pt-0.5">{q.questionText}</p>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                                                                {q.options.map((opt, oIdx) => (
                                                                    <div key={oIdx} className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${q.correctAnswer === oIdx ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-white border-slate-100 text-slate-600'}`}>
                                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${q.correctAnswer === oIdx ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                            {String.fromCharCode(65 + oIdx)}
                                                                        </span>
                                                                        <span className="font-bold">{opt}</span>
                                                                        {q.correctAnswer === oIdx && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in duration-300">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-black text-slate-900">Student Rankings</h3>
                                                <span className="px-4 py-1 rounded-full bg-cyan-50 text-cyan-600 text-xs font-black uppercase tracking-widest">
                                                    {selectedExamDetails.results?.length || 0} Submissions
                                                </span>
                                            </div>

                                            {selectedExamDetails.results?.length === 0 ? (
                                                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                    <p className="text-slate-400 font-bold">No students have taken this exam yet.</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-hidden bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50/50">
                                                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Rank</th>
                                                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                                                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                                                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Time Taken</th>
                                                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Grade</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {selectedExamDetails.results
                                                                ?.sort((a, b) => {
                                                                    if (b.score !== a.score) return b.score - a.score;
                                                                    return a.timeTaken - b.timeTaken;
                                                                })
                                                                .map((res, rIdx) => {
                                                                    const percentage = (res.score / selectedExamDetails.questions.length) * 100;
                                                                    let grade = 'F';
                                                                    if (percentage >= 90) grade = 'A+';
                                                                    else if (percentage >= 80) grade = 'A';
                                                                    else if (percentage >= 70) grade = 'B';
                                                                    else if (percentage >= 60) grade = 'C';
                                                                    else if (percentage >= 50) grade = 'D';

                                                                    return (
                                                                        <tr key={res._id} className="hover:bg-slate-50/50 transition-colors">
                                                                            <td className="px-6 py-5">
                                                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${rIdx === 0 ? 'bg-amber-100 text-amber-700' : rIdx === 1 ? 'bg-slate-200 text-slate-700' : rIdx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>
                                                                                    {rIdx + 1}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-5">
                                                                                <p className="font-bold text-slate-900">{res.student?.name || 'Anonymous'}</p>
                                                                            </td>
                                                                            <td className="px-6 py-5 text-center">
                                                                                <span className="font-black text-cyan-600">{res.score}</span>
                                                                                <span className="text-slate-400 text-xs ml-1">/ {selectedExamDetails.questions.length}</span>
                                                                            </td>
                                                                            <td className="px-6 py-5 text-center font-medium text-slate-500">
                                                                                {Math.floor(res.timeTaken / 60)}m {res.timeTaken % 60}s
                                                                            </td>
                                                                            <td className="px-6 py-5 text-right">
                                                                                <span className={`px-3 py-1 rounded-lg text-xs font-black ${percentage >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                                    {grade}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-slate-500">Failed to load details.</p>
                            )}
                        </div>

                        <div className="p-8 border-t border-slate-100 flex justify-end bg-slate-50/50">
                            <button
                                onClick={() => { setShowDetailsModal(false); setSelectedExamDetails(null); setDetailsTab("questions"); }}
                                className="px-10 py-3 rounded-full bg-slate-900 text-white font-black shadow-xl hover:scale-105 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Exams;
