import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Clock, CheckCircle2, FileText, PlayCircle, Award, X, ChevronRight, ChevronLeft, Shield, AlertCircle } from "lucide-react";
import { getExams, getQuestions, submitExamResult, getMyResults } from "../../api/services";

const StudentExams = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [completedExams, setCompletedExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(true);
    const isIndependent = user?.userType === 'independent';
    const [activeTab, setActiveTab] = useState("all");

    // Exam Player State
    const [activeExam, setActiveExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [examResult, setExamResult] = useState(null);
    const [violationCount, setViolationCount] = useState(0);
    const [isViolationOverlay, setIsViolationOverlay] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const [pendingExam, setPendingExam] = useState(null);

    // NEET Player State
    const [activeSubject, setActiveSubject] = useState("Physics");

    useEffect(() => {
        const fetchExams = async () => {
            try {
                // Fetch real student results
                const resultsData = await getMyResults();
                setCompletedExams(resultsData);

                const submittedExamIds = new Set(
                    (Array.isArray(resultsData) ? resultsData : [])
                        .map((result) => result.exam?._id)
                        .filter(Boolean)
                );

                // Fetch all active exams and hide already submitted ones
                const data = await getExams();
                const availableExams = Array.isArray(data)
                    ? data.filter((exam) => !submittedExamIds.has(exam._id))
                    : [];
                setUpcomingExams(availableExams);

                // If we navigated here with a specific exam to start, 
                // handle it immediately after data is fetched.
                if (location.state?.startExamId) {
                    const exam = availableExams.find(e => e._id === location.state.startExamId);
                    if (exam) handleStartExam(exam);
                }
            } catch (error) {
                console.error("Error fetching exams:", error);
            } finally {
                setLoading(false);
                setLoadingResults(false);
            }
        };
        fetchExams();
    }, [user, location.state]);

    const filteredExams = upcomingExams.filter(e => {
        if (activeTab === "all") return true;
        if (isIndependent) {
            // Independent (NEET/JEE/PSC) students: toggle between subject-wise and full mock
            if (activeTab === "subject-wise") {
                return e.examType === "subject-wise" || e.examType === "official";
            }
            return e.examType === "mock";
        }
        // Institutional students: toggle between subject-wise and official
        if (activeTab === "official") {
            return e.examType === "official";
        }
        return e.examType === "subject-wise" || !e.examType;
    });

    const enterFullscreen = () => {
        const docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
    };

    const handleStartExam = (exam) => {
        setPendingExam(exam);
        setIsInstructionsOpen(true);
    };

    const confirmStartExam = async () => {
        if (!pendingExam) return;
        const exam = pendingExam;
        setIsInstructionsOpen(false);
        setLoading(true);
        try {
            const qs = await getQuestions(exam._id);
            setQuestions(qs);
            setActiveExam(exam);
            setTimeLeft(exam.duration * 60);
            setCurrentQuestionIndex(0);
            setSelectedAnswers({});
            setExamResult(null);
            setViolationCount(0);

            // Set initial NEET focus if applicable
            if (exam.isNeetPattern) {
                setActiveSubject("Physics");
            }

            // Request Fullscreen
            try {
                enterFullscreen();
            } catch (err) {
                console.warn("Fullscreen request failed", err);
            }
        } catch (error) {
            toast.error("Error starting exam: " + error);
        } finally {
            setLoading(false);
            setPendingExam(null);
        }
    };

    const handleReviewExam = async (result) => {
        setLoading(true);
        try {
            const qs = await getQuestions(result.exam._id);
            setQuestions(qs);
            setActiveExam(result.exam);
            setExamResult(result);
        } catch (error) {
            toast.error("Error loading review: " + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer;
        if (activeExam && timeLeft > 0 && !examResult) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && activeExam && !examResult) {
            handleSubmitExam("Time Up");
        }
        return () => clearInterval(timer);
    }, [activeExam, timeLeft, examResult]);

    // Proctoring Logic & Integrity
    useEffect(() => {
        if (!activeExam || examResult) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation("Tab/Window Switch");
            }
        };

        const handleBlur = () => {
            handleViolation("Lost Focus");
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !activeExam?.isManualExit && !examResult) {
                handleViolation("Exited Fullscreen");
            }
        };

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ''; // Standard for modern browsers to show a 'Leave site?' dialog
        };

        const handleContextMenu = (e) => e.preventDefault();
        const handleCopyPaste = (e) => {
            toast.error("Copy/Paste is disabled during exams!");
            e.preventDefault();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);
        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("copy", handleCopyPaste);
        document.addEventListener("paste", handleCopyPaste);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("copy", handleCopyPaste);
            document.removeEventListener("paste", handleCopyPaste);
        };
    }, [activeExam, examResult]);

    const handleViolation = (reason) => {
        if (examResult) return;

        setViolationCount((prev) => {
            const next = prev + 1;
            if (next >= 3) {
                toast.error(`Automated Submission: Multiple proctoring violations (${reason})`, { duration: 6000 });
                handleSubmitExam(`Locked out: ${reason}`);
            } else {
                toast.error(`WARNING: Proctoring Violation (${reason}) Detected! (${next}/3). Switching tabs is forbidden.`, { duration: 5000 });
                setIsViolationOverlay(true);
            }
            return next;
        });
    };

    const handleAnswerSelect = (questionId, optionIndex) => {
        // NEET Section B logic: prevent more than 10 attempts
        if (activeExam?.isNeetPattern) {
            const question = questions.find(q => q._id === questionId);
            if (question && selectedAnswers[questionId] === undefined) {
                const sub = question.subject;
                const subjectAnswersCount = Object.keys(selectedAnswers).filter(qId => {
                    const q = questions.find(qu => qu._id === qId);
                    return q && q.subject === sub;
                }).length;

                const limit = sub === 'Biology' ? 90 : 45;
                if (subjectAnswersCount >= limit) {
                    toast.error(`In NEET, you can only attempt ${limit} questions for ${sub}.`);
                    return;
                }
            }
        }

        setSelectedAnswers({
            ...selectedAnswers,
            [questionId]: optionIndex,
        });
    };

    const handleSubmitExam = async (statusReason = "Normal") => {
        setIsSubmitting(true);
        try {
            const formattedAnswers = Object.entries(selectedAnswers).map(([qId, opt]) => ({
                questionId: qId,
                selectedOption: opt,
            }));
            const res = await submitExamResult(activeExam._id, {
                answers: formattedAnswers,
                timeTaken: activeExam.duration * 60 - timeLeft,
                submissionStatus: statusReason 
            });
            setExamResult(res);
            setUpcomingExams((prev) => prev.filter((exam) => exam._id !== activeExam._id));
            setCompletedExams((prev) => [{ ...res, exam: activeExam }, ...prev]);

            // Exit fullscreen
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }

            // Re-fetch questions with correct answers & explanations now that result exists
            try {
                const fullQuestions = await getQuestions(activeExam._id);
                setQuestions(fullQuestions);
            } catch (e) {
                console.warn("Could not re-fetch questions for review:", e);
            }
        } catch (error) {
            toast.error("Error submitting exam: " + (error.message || error));
        } finally {
            setIsSubmitting(false);
            setIsViolationOverlay(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Filter questions based on NEET subject and section
    const displayQuestions = activeExam?.isNeetPattern 
        ? questions.filter(q => q.subject === activeSubject)
        : questions;

    const subjects = ["Physics", "Chemistry", "Biology"];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-cyan-600 uppercase tracking-[0.16em] mb-1">
                        Exams & assessments
                    </p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Your exams overview
                    </h1>
                    <p className="mt-2 text-slate-500">
                        See upcoming tests, start available exams, and review your submitted scores.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)] gap-8">
                {/* Upcoming / Start exams */}
                <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-cyan-600" />
                            Upcoming & active exams
                        </h2>

                        {/* Tab Switcher */}
                        <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${activeTab === "all"
                                    ? 'bg-white text-cyan-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setActiveTab("subject-wise")}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${activeTab === "subject-wise"
                                    ? 'bg-white text-cyan-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Subject-wise
                            </button>
                            <button
                                onClick={() => setActiveTab(isIndependent ? "mock" : "official")}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${activeTab === (isIndependent ? "mock" : "official")
                                    ? 'bg-white text-cyan-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {isIndependent ? "Full Mock" : "Official"}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {loading && !activeExam ? (
                            <div className="text-center py-10 text-slate-400">Loading exams...</div>
                        ) : filteredExams.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">No {activeTab} exams available.</div>
                        ) : (
                            filteredExams.map((exam) => (
                                <div
                                    key={exam._id}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-50 hover:bg-cyan-50/70 border border-slate-100 hover:border-cyan-100 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <p className="text-base font-bold text-slate-900">
                                            {exam.title}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {exam.subject} • {exam.duration} mins • {new Date(exam.date).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {exam.examCategory !== 'practice' && new Date(exam.date) > new Date() ? (
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100 italic">
                                                Starts at {new Date(exam.date).toLocaleTimeString()}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleStartExam(exam)}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-cyan-600 text-white text-sm font-bold shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-all hover:scale-105"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                                <span>Start exam</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Submitted exams & marks placeholder */}
                <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Submitted exams & results
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {loadingResults ? (
                            <div className="text-center py-10 text-slate-400">Loading results...</div>
                        ) : completedExams.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">No results found yet.</div>
                        ) : (
                            completedExams.map((result) => {
                                const total = result.exam?.totalMarks || result.answers?.length || 1;
                                const percentage = (result.score / total) * 100;
                                let grade = 'F';
                                if (percentage >= 90) grade = 'A+';
                                else if (percentage >= 80) grade = 'A';
                                else if (percentage >= 70) grade = 'B';
                                else if (percentage >= 60) grade = 'C';
                                else if (percentage >= 50) grade = 'D';

                                return (
                                    <div
                                        key={result._id}
                                        className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-100 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-900">
                                                {result.exam?.title || 'Unknown Exam'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                                                {result.exam?.subject || 'General'} • {new Date(result.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    Score
                                                </p>
                                                <p className="text-sm font-black text-slate-900">
                                                    {result.score}/{result.exam?.totalMarks || result.answers?.length || 0}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => handleReviewExam(result)}
                                                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
                                            >
                                                Review
                                            </button>
                                            <span className={`w-8 h-8 rounded-full text-[10px] font-black flex items-center justify-center ${percentage >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {grade}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>

            {/* Exam Player Modal */}
            {activeExam && questions.length > 0 && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Player Header */}
                        <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-cyan-600 text-white rounded-2xl shadow-lg shadow-cyan-600/20">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">{activeExam.title}</h2>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{activeExam.subject}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black ${timeLeft < 300 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-cyan-50 text-cyan-600'}`}>
                                    <Clock className="w-5 h-5" />
                                    <span className="text-lg">{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        </div>

                        {activeExam.isNeetPattern && !examResult && (
                            <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-4">
                                {subjects.map((sub) => {
                                    const attemptedCount = Object.keys(selectedAnswers).filter(qId => {
                                        const q = questions.find(qu => qu._id === qId);
                                        return q && q.subject === sub;
                                    }).length;
                                    const limit = sub === 'Biology' ? 90 : 45;
                                    const totalQs = sub === 'Biology' ? 100 : 50;

                                    return (
                                        <button
                                            key={sub}
                                            onClick={() => {
                                                setActiveSubject(sub);
                                                const firstQIndex = questions.findIndex(q => q.subject === sub);
                                                if (firstQIndex !== -1) setCurrentQuestionIndex(firstQIndex);
                                            }}
                                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeSubject === sub ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-100 scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                                        >
                                            <span>{sub}</span>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeSubject === sub ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                {attemptedCount}/{limit}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Player Body */}
                        <div className="flex-1 overflow-y-auto p-8">
                            {examResult ? (
                                <div className="max-w-md mx-auto py-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                        <Award className="w-12 h-12 text-emerald-600" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900">Exam Submitted!</h3>
                                    <p className="text-slate-500 font-medium">Review your performance below. You can see correct answers and explanations.</p>
                                    <div className="p-8 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex flex-col items-center gap-2">
                                        <span className="text-xs font-black text-slate-400 underline decoration-cyan-500 underline-offset-4 decoration-2">YOUR SCORE</span>
                                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-indigo-600">{examResult.score} / {activeExam.totalMarks || examResult.answers?.length || questions.length}</span>
                                    </div>

                                    <div className="text-left space-y-6 pt-10 border-t border-slate-100">
                                        <h4 className="text-lg font-black text-slate-800">Detailed Review</h4>
                                        {questions.map((q, idx) => {
                                            const studentAns = examResult.answers?.find(a => a.questionId === q._id);
                                            const isCorrect = studentAns?.isCorrect;
                                            return (
                                                <div key={idx} className="space-y-3 p-5 rounded-3xl bg-slate-50 border border-slate-200">
                                                    <div className="flex items-start gap-4">
                                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                                            {idx + 1}
                                                        </span>
                                                        <div className="flex-1 space-y-2">
                                                            <div>
                                                                {activeExam.isNeetPattern && (
                                                                    <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1 block">
                                                                        {q.subject}
                                                                    </span>
                                                                )}
                                                                <p className="font-bold text-slate-900 underline decoration-slate-200 decoration-2 underline-offset-4">{q.questionText}</p>
                                                            </div>
                                                            {q.imageUrl && (
                                                                <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-white">
                                                                    <img src={q.imageUrl} alt="Context" className="max-h-[200px] w-auto object-contain p-2" />
                                                                </div>
                                                            )}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                                                {q.options.map((opt, oIdx) => (
                                                                    <div 
                                                                        key={oIdx} 
                                                                        className={`p-3 rounded-2xl text-xs font-bold border-2 flex items-center gap-2 ${
                                                                            oIdx === q.correctAnswer 
                                                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                                                                                : oIdx === studentAns?.selectedOption 
                                                                                    ? 'bg-rose-50 border-rose-500 text-rose-700' 
                                                                                    : 'bg-white border-transparent text-slate-500'
                                                                        }`}
                                                                    >
                                                                        <span className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center">{String.fromCharCode(65 + oIdx)}</span>
                                                                        {opt}
                                                                        {oIdx === q.correctAnswer && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                                                                        {oIdx === studentAns?.selectedOption && !isCorrect && <X className="w-3 h-3 ml-auto" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {q.explanation && (
                                                                <div className="mt-4 p-4 bg-cyan-50 rounded-2xl border-l-4 border-cyan-400">
                                                                    <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Explanation</p>
                                                                    <p className="text-xs text-cyan-900 leading-relaxed italic">{q.explanation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => { setActiveExam(null); setExamResult(null); }}
                                        className="w-full py-4 rounded-full bg-slate-900 text-white font-black shadow-xl hover:scale-[1.02] transition-all mt-8"
                                    >
                                        Close Portal
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Question navigation dots - Filtered by Subject/Section if NEET */}
                                    <div className="flex flex-wrap gap-2">
                                        {activeExam.isNeetPattern && (
                                            <div className="w-full flex items-center gap-2 mb-2">
                                                <button 
                                                    onClick={() => setActiveSection("A")}
                                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${activeSection === 'A' ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-400'}`}
                                                >
                                                    Section A
                                                </button>
                                                <button 
                                                    onClick={() => setActiveSection("B")}
                                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${activeSection === 'B' ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-400'}`}
                                                >
                                                    Section B
                                                </button>
                                                {activeSection === 'B' && (
                                                    <span className="ml-auto text-[10px] font-black text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                                                        Attempted: {Object.keys(selectedAnswers).filter(qId => {
                                                            const q = questions.find(qu => qu._id === qId);
                                                            return q && q.subject === activeSubject && q.section === 'B';
                                                        }).length} / 10
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {questions.map((q, idx) => {
                                            // Only show dots for current focused subject/section if NEET
                                            if (activeExam.isNeetPattern && (q.subject !== activeSubject || q.section !== activeSection)) return null;
                                            
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentQuestionIndex(idx)}
                                                    className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentQuestionIndex === idx
                                                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                                                        : selectedAnswers[questions[idx]._id] !== undefined
                                                            ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100'
                                                            : 'bg-slate-50 text-slate-400 border-2 border-transparent hover:border-slate-200'
                                                        }`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Current Question */}
                                    {questions[currentQuestionIndex] && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-2">
                                                {activeExam.isNeetPattern && (
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                                                        {questions[currentQuestionIndex].subject} • Section {questions[currentQuestionIndex].section}
                                                    </span>
                                                )}
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                                                {questions[currentQuestionIndex].questionText}
                                            </h3>
                                            {questions[currentQuestionIndex]?.imageUrl && (
                                                <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 max-w-2xl mx-auto bg-slate-50">
                                                    <img 
                                                        src={questions[currentQuestionIndex].imageUrl} 
                                                        alt="Question Illustration" 
                                                        className="max-h-[400px] w-auto mx-auto object-contain p-4"
                                                    />
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {questions[currentQuestionIndex].options.map((option, oIdx) => (
                                                    <button
                                                        key={oIdx}
                                                        onClick={() => handleAnswerSelect(questions[currentQuestionIndex]._id, oIdx)}
                                                        className={`p-6 rounded-3xl border-2 text-left transition-all group ${selectedAnswers[questions[currentQuestionIndex]._id] === oIdx
                                                            ? 'bg-cyan-50 border-cyan-500 shadow-sm'
                                                            : 'bg-white border-slate-100 hover:border-cyan-200 shadow-sm'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${selectedAnswers[questions[currentQuestionIndex]._id] === oIdx
                                                                ? 'bg-cyan-600 text-white shadow-lg'
                                                                : 'bg-slate-50 text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600'
                                                                }`}>
                                                                {String.fromCharCode(65 + oIdx)}
                                                            </span>
                                                            <span className={`font-bold ${selectedAnswers[questions[currentQuestionIndex]._id] === oIdx
                                                                ? 'text-cyan-900'
                                                                : 'text-slate-600'
                                                                }`}>
                                                                {option}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Deselect button if needed */}
                                            {selectedAnswers[questions[currentQuestionIndex]._id] !== undefined && (
                                                <button 
                                                    onClick={() => {
                                                        const newAnswers = {...selectedAnswers};
                                                        delete newAnswers[questions[currentQuestionIndex]._id];
                                                        setSelectedAnswers(newAnswers);
                                                    }}
                                                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                                >
                                                    Clear selection
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Player Footer */}
                        {!examResult && (
                            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex gap-4">
                                    <button
                                        disabled={currentQuestionIndex === 0}
                                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                        className="flex items-center gap-2 px-6 py-3 rounded-full font-black text-slate-400 hover:text-cyan-600 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        Previous
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            const newAnswers = {...selectedAnswers};
                                            delete newAnswers[questions[currentQuestionIndex]._id];
                                            setSelectedAnswers(newAnswers);
                                        }}
                                        disabled={selectedAnswers[questions[currentQuestionIndex]._id] === undefined}
                                        className="px-6 py-3 rounded-full font-black text-xs text-rose-500 hover:bg-rose-50 disabled:opacity-0 transition-all"
                                    >
                                        Clear Choice
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    {currentQuestionIndex < questions.length - 1 && (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                            className="px-8 py-3 rounded-full border-2 border-slate-200 text-slate-500 font-black hover:bg-slate-100 transition-all text-xs"
                                        >
                                            Skip & Next
                                        </button>
                                    )}

                                    {currentQuestionIndex === questions.length - 1 ? (
                                        <button
                                            onClick={() => handleSubmitExam("Normal")}
                                            disabled={isSubmitting}
                                            className="px-10 py-3 rounded-full bg-emerald-600 text-white font-black shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-105 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Finish & Submit Exam'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                            className="flex items-center gap-2 px-8 py-3 rounded-full bg-slate-900 text-white font-black hover:bg-cyan-600 transition-all shadow-xl"
                                        >
                                            Next Question
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Violation Overlay */}
            {isViolationOverlay && !examResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="max-w-md w-full p-10 bg-white rounded-[3rem] text-center space-y-6 shadow-2xl">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Proctoring Warning!</h2>
                        <p className="text-slate-500 font-medium">
                            You switched tabs or lost focus. This is strictly prohibited. 
                            <span className="block mt-2 font-bold text-rose-600">Violation {violationCount}/3</span>
                        </p>
                        <p className="text-sm text-slate-400">If you reach 3 violations, your exam will be submitted automatically.</p>
                        <button 
                            onClick={() => {
                                setIsViolationOverlay(false);
                                enterFullscreen();
                            }}
                            className="w-full py-4 bg-slate-900 text-white font-black rounded-full hover:scale-105 transition-all"
                        >
                            I Understand, Resume Exam
                        </button>
                    </div>
                </div>
            )}

            {/* Exam Instructions Modal */}
            {isInstructionsOpen && pendingExam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className="p-8 space-y-8 flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="p-4 bg-cyan-600 text-white rounded-[1.5rem] shadow-xl shadow-cyan-100 shrink-0">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-2xl font-black text-slate-900 truncate">Exam Guidelines</h2>
                                    <p className="text-slate-500 font-medium truncate">Please read carefully.</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                                <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-3 bg-white rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                                            <p className="text-sm font-black text-slate-900">{pendingExam.duration}m</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</p>
                                            <p className="text-sm font-black text-slate-900 truncate px-1">{pendingExam.subject}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Qns</p>
                                            <p className="text-sm font-black text-slate-900">{pendingExam.totalMarks}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Proctoring Rules</h3>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                                <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">1</div>
                                                <span>The exam will open in <span className="text-slate-900 font-black">Fullscreen Mode</span>. Do not exit until finished.</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                                <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">2</div>
                                                <span>Switching tabs, minimizing the browser, or opening other apps is strictly detected.</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm font-bold text-rose-600">
                                                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">3</div>
                                                <span>You have a <span className="text-rose-700 font-black">3-Strike Limit</span>. Reaching 3 violations will result in Automatic Submission.</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                                <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">4</div>
                                                <span><span className="text-slate-900 font-black">Total Lockdown</span>: The only way to exit is by finishing. You cannot cancel or go back.</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                                <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">5</div>
                                                <span>Right-click, Copy, and Paste are disabled during the session.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => {
                                        setIsInstructionsOpen(false);
                                        setPendingExam(null);
                                    }}
                                    className="flex-1 py-4 px-6 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all"
                                >
                                    Go Back
                                </button>
                                <button 
                                    onClick={confirmStartExam}
                                    className="flex-[2] py-4 px-6 rounded-full bg-slate-900 text-white font-black shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    I Agree & Start Exam
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentExams;
