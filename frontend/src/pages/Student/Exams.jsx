import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Clock, CheckCircle2, FileText, PlayCircle, Award, X, ChevronRight, ChevronLeft, Shield, AlertCircle, Trophy, Medal } from "lucide-react";
import { getExams, getQuestions, submitExamResult, getMyResults } from "../../api/services";
import apiClient from "../../api/apiClient";


const StudentExams = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [completedExams, setCompletedExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    // Exam Player State
    const [activeExam, setActiveExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [questionStatuses, setQuestionStatuses] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [examResult, setExamResult] = useState(null);
    const [violationCount, setViolationCount] = useState(0);
    const [isViolationOverlay, setIsViolationOverlay] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const [pendingExam, setPendingExam] = useState(null);

    // Ranklist State
    const [ranklistModal, setRanklistModal] = useState(null); // { examId, examTitle, totalMarks, totalParticipants, ranklist }
    const [ranklistLoading, setRanklistLoading] = useState(false);


    // Patterned Exam Player State
    const [activeSectionName, setActiveSectionName] = useState("");

    useEffect(() => {
        const fetchExams = async () => {
            try {
                // Fetch real student results
                const resultsData = await getMyResults();
                const filteredResults = (Array.isArray(resultsData) ? resultsData : []).filter(r => r.exam);
                setCompletedExams(filteredResults);

                const submittedExamIds = new Set(
                    filteredResults
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

        const isOfficial = !e.teacher || e.teacher.role === 'admin' || e.teacher.role === 'superadmin' || e.examType === 'official';

        if (activeTab === "official") {
            return isOfficial;
        }
        if (activeTab === "subject-wise") {
            return !isOfficial;
        }
        return true;
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
            setQuestionStatuses({});
            setExamResult(null);
            setViolationCount(0);

            // Set initial Section focus if applicable
            if (exam.sections && exam.sections.length > 0) {
                setActiveSectionName(exam.sections[0].name);
            } else if (exam.isNeetPattern) {
                setActiveSectionName("Physics"); // Fallback
            }

            // Request Fullscreen
            try {
                enterFullscreen();
            } catch (err) {
                console.warn("Fullscreen request failed", err);
            }
            // Infer sections for older exams that were created without sections
            if ((!exam.sections || exam.sections.length === 0) && qs.some(q => q.sectionName)) {
                const names = [...new Set(qs.map(q => q.sectionName).filter(Boolean))];
                const generatedSections = names.map((name) => ({
                    name,
                    totalQuestions: qs.filter(q => q.sectionName === name).length,
                    attendQuestions: qs.filter(q => q.sectionName === name).length,
                }));
                setActiveExam((prev) => ({ ...prev, sections: generatedSections }));
                setActiveSectionName(names[0] || "");
                console.debug("Inferred sections for existing exam:", generatedSections);
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
            if ((!result.exam.sections || result.exam.sections.length === 0) && qs.some(q => q.sectionName)) {
                const names = [...new Set(qs.map(q => q.sectionName).filter(Boolean))];
                const generatedSections = names.map((name) => ({
                    name,
                    totalQuestions: qs.filter(q => q.sectionName === name).length,
                    attendQuestions: qs.filter(q => q.sectionName === name).length,
                }));
                setActiveExam((prev) => ({ ...prev, sections: generatedSections }));
                setActiveSectionName(names[0] || "");
                console.debug("Inferred sections for existing exam review:", generatedSections);
            }
            setExamResult(result);
            setQuestionStatuses({});
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
        // Section limit enforcement (e.g., NEET 45/50)
        const question = questions.find(q => q._id === questionId);
        if (question && selectedAnswers[questionId] === undefined) {
            const section = activeExam.sections?.find(s => s.name === question.sectionName);

            if (section && section.attendQuestions) {
                const attemptedInSection = Object.keys(selectedAnswers).filter(qId => {
                    const q = questions.find(qu => qu._id === qId);
                    return q && q.sectionName === section.name;
                }).length;

                if (attemptedInSection >= section.attendQuestions) {
                    toast.error(`You can only attempt ${section.attendQuestions} questions in ${section.name}.`);
                    return;
                }
            }
        }

        setSelectedAnswers({
            ...selectedAnswers,
            [questionId]: optionIndex,
        });
        setQuestionStatuses((prev) => ({
            ...prev,
            [questionId]: prev[questionId] === "markedForReview" || prev[questionId] === "answeredMarkedForReview"
                ? "answeredMarkedForReview"
                : "answered",
        }));
        console.debug("handleAnswerSelect:", { questionId, optionIndex, selectedAnswersBefore: selectedAnswers });
    };

    useEffect(() => {
        const questionId = questions[currentQuestionIndex]?._id;
        if (!activeExam || examResult || !questionId) return;

        setQuestionStatuses((prev) => {
            if (prev[questionId]) return prev;
            return { ...prev, [questionId]: "notAnswered" };
        });
    }, [activeExam, examResult, questions, currentQuestionIndex]);

    // Initialize statuses for all questions to avoid missing keys in counts
    useEffect(() => {
        if (!questions || questions.length === 0) return;
        setQuestionStatuses((prev) => {
            const next = { ...prev };
            let changed = false;
            questions.forEach((q) => {
                if (!q || !q._id) return;
                if (next[q._id] === undefined) {
                    next[q._id] = "notVisited";
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [questions]);

    const getQuestionStatus = (questionId) => {
        const hasAnswer = selectedAnswers[questionId] !== undefined;
        const status = questionStatuses[questionId] || "notVisited";

        if (status === "markedForReview" || status === "answeredMarkedForReview") {
            return hasAnswer ? "answeredMarkedForReview" : "markedForReview";
        }
        if (hasAnswer) return "answered";
        return status;
    };

    const statusCounts = useMemo(() => {
        let visible = Array.isArray(questions) ? questions : [];
        if (activeExam?.sections?.length > 0 && activeSectionName) {
            visible = visible.filter((q) => q.sectionName === activeSectionName);
        }
        return visible.reduce((acc, q) => {
            const s = getQuestionStatus(q._id);
            acc[s] = (acc[s] || 0) + 1;
            return acc;
        }, {});
    }, [questions, selectedAnswers, questionStatuses, activeSectionName, activeExam]);
    console.debug("statusCounts:", statusCounts, { selectedAnswers, questionStatuses });

    // Standard CBT-style status config (JEE/NEET pattern)
    const statusConfig = {
        notVisited: {
            label: "Not Visited",
            // Gray square/circle — untouched questions
            buttonClass: "bg-white text-slate-500 border-2 border-slate-300 hover:border-slate-400",
            dotClass: "bg-slate-300",
            shape: "square",       // rendered as rounded-xl (square-ish)
            description: "You have not visited this question yet.",
        },
        notAnswered: {
            label: "Not Answered",
            // Red circle — visited but no answer given
            buttonClass: "bg-rose-600 text-white border-rose-600 hover:bg-rose-700",
            dotClass: "bg-rose-500",
            shape: "circle",
            description: "You visited this question but did not select any answer.",
        },
        answered: {
            label: "Answered",
            // Green circle — answered questions
            buttonClass: "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600",
            dotClass: "bg-emerald-500",
            shape: "circle",
            description: "You have saved an answer for this question.",
        },
        markedForReview: {
            label: "Marked for Review",
            // Purple circle — flagged, no answer
            buttonClass: "bg-violet-600 text-white border-violet-600 hover:bg-violet-700",
            dotClass: "bg-violet-500",
            shape: "circle",
            description: "You marked this question for review but did NOT select any answer. It will be treated as unattempted.",
        },
        answeredMarkedForReview: {
            label: "Answered & Marked for Review",
            // Purple circle with green dot — answered but still flagged
            buttonClass: "bg-violet-600 text-white border-violet-600 hover:bg-violet-700",
            dotClass: "bg-emerald-400",
            shape: "circle-dot",
            description: "You selected an answer AND marked for review. This answer WILL be evaluated.",
        },
    };

    const clearCurrentAnswer = () => {
        const questionId = questions[currentQuestionIndex]?._id;
        if (!questionId) return;

        const newAnswers = { ...selectedAnswers };
        delete newAnswers[questionId];
        setSelectedAnswers(newAnswers);
        setQuestionStatuses((prev) => ({
            ...prev,
            [questionId]: prev[questionId] === "answeredMarkedForReview" ? "markedForReview" : "notAnswered",
        }));
    };

    const goToNextQuestion = () => {
        // Move to the immediate next question (by index). Update section if the next question belongs to a new section.
        const next = Math.min(currentQuestionIndex + 1, questions.length - 1);
        setCurrentQuestionIndex(next);
        const nextQ = questions[next];
        if (nextQ && activeExam?.sections?.length > 0 && nextQ.sectionName && nextQ.sectionName !== activeSectionName) {
            setActiveSectionName(nextQ.sectionName);
        }
    };

    const skipAndNext = () => {
        const questionId = questions[currentQuestionIndex]?._id;
        if (questionId && selectedAnswers[questionId] === undefined) {
            setQuestionStatuses((prev) => ({
                ...prev,
                [questionId]: prev[questionId] === "markedForReview" ? "markedForReview" : "notAnswered",
            }));
        }
        goToNextQuestion();
    };

    const markForReviewAndNext = () => {
        const questionId = questions[currentQuestionIndex]?._id;
        if (!questionId) return;

        setQuestionStatuses((prev) => ({
            ...prev,
            [questionId]: selectedAnswers[questionId] !== undefined ? "answeredMarkedForReview" : "markedForReview",
        }));
        goToNextQuestion();
    };

    const markCurrentForReview = () => {
        const questionId = questions[currentQuestionIndex]?._id;
        if (!questionId) return;

        setQuestionStatuses((prev) => ({
            ...prev,
            [questionId]: selectedAnswers[questionId] !== undefined ? "answeredMarkedForReview" : "markedForReview",
        }));
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
                                onClick={() => setActiveTab("official")}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${activeTab === "official"
                                    ? 'bg-white text-cyan-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Official
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
                                const calculatedTotal = result.exam?.totalMarks || (result.exam?.totalQuestions * (result.exam?.marksPerQuestion || 1));
                                const total = calculatedTotal > 0 ? calculatedTotal : (result.answers?.length || 1);
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
                                                {result.exam.title}
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
                                                    {result.score}/{result.exam?.totalMarks || (result.exam?.totalQuestions * (result.exam?.marksPerQuestion || 1)) || 0}
                                                </p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    setRanklistLoading(true);
                                                    try {
                                                        const data = await apiClient(`/exams/${result.exam._id}/results`);
                                                        setRanklistModal({ ...data, examId: result.exam._id });
                                                    } catch (e) {
                                                        toast.error(e?.message || 'Failed to load ranklist');
                                                    } finally {
                                                        setRanklistLoading(false);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 border border-indigo-100 transition-all flex items-center gap-1"
                                            >
                                                <Trophy className="w-3.5 h-3.5" />
                                                Ranklist
                                            </button>
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

            {/* Ranklist Modal */}
            {ranklistModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-cyan-600">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Trophy className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-base truncate max-w-[220px]">{ranklistModal.examTitle}</h3>
                                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{ranklistModal.totalParticipants} Students • Out of {ranklistModal.totalMarks}</p>
                                </div>
                            </div>
                            <button onClick={() => setRanklistModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Rank List */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-2">
                            {ranklistModal.ranklist.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">No results yet.</div>
                            ) : ranklistModal.ranklist.map((entry) => {
                                const isMe = entry.studentName === user?.name;
                                const isTop3 = entry.rank <= 3;
                                const medalColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];
                                const bgColors = ['bg-yellow-50 border-yellow-200', 'bg-slate-50 border-slate-200', 'bg-amber-50 border-amber-200'];
                                return (
                                    <div
                                        key={entry.rank}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-2xl border-2 transition-all ${isMe
                                                ? 'bg-cyan-50 border-cyan-300 shadow-md shadow-cyan-100'
                                                : isTop3
                                                    ? `${bgColors[entry.rank - 1]}`
                                                    : 'bg-slate-50 border-slate-100'
                                            }`}
                                    >
                                        <div className="w-8 flex items-center justify-center shrink-0">
                                            {isTop3 ? (
                                                <Medal className={`w-6 h-6 ${medalColors[entry.rank - 1]}`} />
                                            ) : (
                                                <span className="text-sm font-black text-slate-400">#{entry.rank}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${isMe ? 'text-cyan-700' : 'text-slate-800'}`}>
                                                {entry.studentName} {isMe && <span className="text-[10px] font-black text-cyan-500 ml-1 bg-cyan-100 px-1.5 py-0.5 rounded-full">YOU</span>}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-base font-black ${isMe ? 'text-cyan-700' : isTop3 ? medalColors[entry.rank - 1] : 'text-slate-700'}`}>
                                                {entry.score}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">marks</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading overlay for ranklist */}
            {ranklistLoading && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold text-slate-700">Loading ranklist...</span>
                    </div>
                </div>
            )}

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

                        {activeExam.sections && activeExam.sections.length > 0 && !examResult && (
                            <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-4">
                                {activeExam.sections.map((section) => {
                                    const attemptedCount = Object.keys(selectedAnswers).filter(qId => {
                                        const q = questions.find(qu => qu._id === qId);
                                        return q && q.sectionName === section.name;
                                    }).length;

                                    return (
                                        <button
                                            key={section.name}
                                            onClick={() => {
                                                setActiveSectionName(section.name);
                                                const firstQIndex = questions.findIndex(q => q.sectionName === section.name);
                                                if (firstQIndex !== -1) setCurrentQuestionIndex(firstQIndex);
                                            }}
                                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeSectionName === section.name ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-100 scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                                        >
                                            <span>{section.name}</span>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeSectionName === section.name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                {attemptedCount}/{section.attendQuestions || section.totalQuestions}
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
                                    <p className="text-slate-500 font-medium">Your exam has been successfully recorded. You can view your final score below.</p>
                                    <div className="p-8 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex flex-col items-center gap-2">
                                        <span className="text-xs font-black text-slate-400 underline decoration-cyan-500 underline-offset-4 decoration-2">YOUR SCORE</span>
                                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-indigo-600">{examResult.score} / {activeExam.totalMarks || (activeExam.totalQuestions * (activeExam.marksPerQuestion || 1)) || (questions.length * (activeExam.marksPerQuestion || 1))}</span>
                                    </div>


                                    <button
                                        onClick={() => { setActiveExam(null); setExamResult(null); }}
                                        className="w-full py-4 rounded-full bg-slate-900 text-white font-black shadow-xl hover:scale-[1.02] transition-all mt-8"
                                    >
                                        Close Portal
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8">
                                    {/* Current Question */}
                                    {questions[currentQuestionIndex] && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-2">
                                                {activeExam.sections?.length > 0 && (
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                                                        {questions[currentQuestionIndex].sectionName}
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
                                                    onClick={clearCurrentAnswer}
                                                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                                >
                                                    Clear selection
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <aside className="bg-white border border-slate-200 rounded-3xl p-5 space-y-5 h-fit lg:sticky lg:top-0 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Palette</p>
                                                <h4 className="text-sm font-black text-slate-900 mt-0.5">Answer Status</h4>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{questions.filter(q => activeExam.sections?.length > 0 ? q.sectionName === activeSectionName : true).length} Qns</span>
                                        </div>

                                        {/* Standard CBT Question Number Grid */}
                                        <div className="grid grid-cols-5 gap-2">
                                            {questions.map((q, idx) => {
                                                if (activeExam.sections?.length > 0 && q.sectionName !== activeSectionName) return null;

                                                const status = getQuestionStatus(q._id);
                                                const cfg = statusConfig[status];
                                                const isCurrent = currentQuestionIndex === idx;
                                                // Use circle for all statuses except notVisited (square)
                                                const shapeClass = cfg.shape === "square" ? "rounded-lg" : "rounded-full";

                                                return (
                                                    <button
                                                        key={q._id || idx}
                                                        onClick={() => setCurrentQuestionIndex(idx)}
                                                        title={cfg.label}
                                                        className={`relative w-10 h-10 ${shapeClass} border-2 font-black text-xs transition-all ${cfg.buttonClass} ${isCurrent ? 'ring-2 ring-offset-2 ring-cyan-400 scale-110 shadow-lg' : 'hover:scale-105'}`}
                                                    >
                                                        {idx + 1}
                                                        {/* Green dot indicator for Answered+Review */}
                                                        {status === "answeredMarkedForReview" && (
                                                            <span className="absolute -right-1 -top-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow" />
                                                        )}
                                                        {/* Bookmark indicator for markedForReview (no answer) */}
                                                        {status === "markedForReview" && (
                                                            <span className="absolute -right-1 -top-1 w-3.5 h-3.5 rounded-full bg-orange-400 border-2 border-white shadow" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Status Legend — Standard CBT Style */}
                                        <div className="space-y-2 border-t border-slate-100 pt-4">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Legend</p>
                                            {Object.entries(statusConfig).map(([key, item]) => {
                                                const shapeClass = item.shape === "square" ? "rounded-md" : "rounded-full";
                                                return (
                                                    <div key={key} className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-600">
                                                        <span className={`relative w-5 h-5 ${shapeClass} flex items-center justify-center flex-shrink-0 border-2 ${item.buttonClass}`}>
                                                            {key === "answeredMarkedForReview" && (
                                                                <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
                                                            )}
                                                            {key === "markedForReview" && (
                                                                <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-orange-400 border border-white" />
                                                            )}
                                                        </span>
                                                        <span className="flex-1 leading-tight">{item.label}</span>
                                                        <span className="font-black text-sm text-slate-800">{statusCounts[key] || 0}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </aside>
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
                                            clearCurrentAnswer();
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
                                            onClick={skipAndNext}
                                            className="px-8 py-3 rounded-full border-2 border-slate-200 text-slate-500 font-black hover:bg-slate-100 transition-all text-xs"
                                        >
                                            Skip & Next
                                        </button>
                                    )}

                                    {currentQuestionIndex === questions.length - 1 ? (
                                        <>
                                            <button
                                                onClick={markCurrentForReview}
                                                className="flex items-center gap-2 px-8 py-3 rounded-full bg-violet-600 text-white font-black hover:bg-violet-700 transition-all shadow-xl shadow-violet-600/20"
                                            >
                                                Mark for Review
                                            </button>
                                            <button
                                                onClick={() => handleSubmitExam("Normal")}
                                                disabled={isSubmitting}
                                                className="px-10 py-3 rounded-full bg-emerald-600 text-white font-black shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-105 transition-all disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Finish & Submit Exam'}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={markForReviewAndNext}
                                                className="flex items-center gap-2 px-8 py-3 rounded-full bg-violet-600 text-white font-black hover:bg-violet-700 transition-all shadow-xl shadow-violet-600/20"
                                            >
                                                Mark for Review
                                                <ChevronRight className="w-5 h-5" />
                                            </button>

                                            <button
                                                onClick={goToNextQuestion}
                                                className="flex items-center gap-2 px-8 py-3 rounded-full bg-slate-900 text-white font-black hover:bg-cyan-600 transition-all shadow-xl"
                                            >
                                                Next Question
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
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

                            <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">

                                {/* Exam Info */}
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                                        <p className="text-base font-black text-slate-900">{pendingExam.duration}m</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</p>
                                        <p className="text-base font-black text-slate-900 truncate px-1">{pendingExam.subject}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Qns</p>
                                        <p className="text-base font-black text-slate-900">{pendingExam.totalMarks}</p>
                                    </div>
                                </div>

                                {/* ── Question Status Guide ── */}
                                <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 space-y-4">
                                    <h3 className="text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">?</span>
                                        Question Status Guide
                                    </h3>
                                    <p className="text-[11px] text-indigo-600 font-medium">Each question in the palette is colour-coded. Here is what each colour means:</p>
                                    <div className="space-y-3">
                                        {/* Not Visited */}
                                        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-100">
                                            <span className="w-9 h-9 rounded-lg border-2 border-slate-300 bg-white text-slate-500 font-black text-xs flex items-center justify-center shrink-0">1</span>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">Not Visited</p>
                                                <p className="text-[10px] text-slate-500 font-medium">You have not opened this question yet.</p>
                                            </div>
                                        </div>
                                        {/* Not Answered */}
                                        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-100">
                                            <span className="w-9 h-9 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">Not Answered</p>
                                                <p className="text-[10px] text-slate-500 font-medium">You visited this question but skipped it without selecting any answer.</p>
                                            </div>
                                        </div>
                                        {/* Answered */}
                                        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-100">
                                            <span className="w-9 h-9 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">Answered</p>
                                                <p className="text-[10px] text-slate-500 font-medium">You have selected and saved an answer. This question will be evaluated.</p>
                                            </div>
                                        </div>
                                        {/* Marked for Review */}
                                        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-100">
                                            <div className="relative shrink-0">
                                                <span className="w-9 h-9 rounded-full bg-violet-600 text-white font-black text-xs flex items-center justify-center">4</span>
                                                <span className="absolute -right-0.5 -top-0.5 w-3 h-3 rounded-full bg-orange-400 border-2 border-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">Marked for Review <span className="text-orange-500">(No Answer)</span></p>
                                                <p className="text-[10px] text-slate-500 font-medium">Flagged to revisit later, but no answer selected. Treated as <span className="font-black text-rose-600">unattempted</span> on submission.</p>
                                            </div>
                                        </div>
                                        {/* Answered + Marked for Review */}
                                        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-100">
                                            <div className="relative shrink-0">
                                                <span className="w-9 h-9 rounded-full bg-violet-600 text-white font-black text-xs flex items-center justify-center">5</span>
                                                <span className="absolute -right-0.5 -top-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">Answered & Marked for Review <span className="text-emerald-600">(Green dot)</span></p>
                                                <p className="text-[10px] text-slate-500 font-medium">You selected an answer but want to revisit. This answer <span className="font-black text-emerald-700">WILL be evaluated</span>.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">⚠ Important Rule</p>
                                        <p className="text-[11px] text-amber-700 font-semibold">The "Mark for Review" button is only a bookmark — it does NOT change how your answer is graded. Any question with a selected answer will always be evaluated, even if marked for review.</p>
                                    </div>
                                </div>

                                {/* Proctoring Rules */}
                                <div className="bg-slate-50 p-5 rounded-3xl space-y-4 border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Proctoring Rules</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                            <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">1</div>
                                            <span>The exam will open in <span className="text-slate-900 font-black">Fullscreen Mode</span>. Do not exit until finished.</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                            <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">2</div>
                                            <span>Switching tabs, minimizing the browser, or opening other apps is strictly detected.</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm font-bold text-rose-600">
                                            <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">3</div>
                                            <span>You have a <span className="text-rose-700 font-black">3-Strike Limit</span>. Reaching 3 violations will result in Automatic Submission.</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                            <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">4</div>
                                            <span><span className="text-slate-900 font-black">Total Lockdown</span>: The only way to exit is by finishing. You cannot cancel or go back.</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                            <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">5</div>
                                            <span>Right-click, Copy, and Paste are disabled during the session.</span>
                                        </li>
                                    </ul>
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
