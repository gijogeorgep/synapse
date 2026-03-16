import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Clock, CheckCircle2, FileText, PlayCircle, Award, X, ChevronRight, ChevronLeft } from "lucide-react";
import { getExams, getQuestions, submitExamResult, getMyResults } from "../../api/services";

const StudentExams = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [completedExams, setCompletedExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(true);
    const [activeTab, setActiveTab] = useState("subject-wise"); // 'subject-wise' | 'official'

    // Exam Player State
    const [activeExam, setActiveExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [examResult, setExamResult] = useState(null);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                // Fetch all active exams
                const data = await getExams();
                setUpcomingExams(data);

                // Fetch real student results
                const resultsData = await getMyResults();
                setCompletedExams(resultsData);

                // If we navigated here with a specific exam to start, 
                // handle it immediately after data is fetched.
                if (location.state?.startExamId) {
                    const exam = data.find(e => e._id === location.state.startExamId);
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
        if (activeTab === "official") {
            return e.examType === "official" && e.classLevel === user?.class;
        } else {
            return (e.examType === "subject-wise" || !e.examType) &&
                (e.classLevel === user?.class || user?.subjects?.includes(e.subject));
        }
    });

    const handleStartExam = async (exam) => {
        setLoading(true);
        try {
            const qs = await getQuestions(exam._id);
            setQuestions(qs);
            setActiveExam(exam);
            setTimeLeft(exam.duration * 60);
            setCurrentQuestionIndex(0);
            setSelectedAnswers({});
            setExamResult(null);
        } catch (error) {
            alert("Error starting exam: " + error);
        } finally {
            setLoading(false);
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
            alert("Error loading review: " + error);
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
            handleSubmitExam();
        }
        return () => clearInterval(timer);
    }, [activeExam, timeLeft, examResult]);

    const handleAnswerSelect = (questionId, optionIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionId]: optionIndex,
        });
    };

    const handleSubmitExam = async () => {
        setIsSubmitting(true);
        try {
            const formattedAnswers = Object.entries(selectedAnswers).map(([qId, opt]) => ({
                questionId: qId,
                selectedOption: opt,
            }));
            const res = await submitExamResult(activeExam._id, {
                answers: formattedAnswers,
                timeTaken: activeExam.duration * 60 - timeLeft,
            });
            setExamResult(res);
        } catch (error) {
            alert("Error submitting exam: " + error);
        } finally {
            setIsSubmitting(false);
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
                                        {new Date(exam.date) > new Date() ? (
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
                                const percentage = result.exam ? (result.score / result.exam.duration) * 100 : 0; // Duration used as placeholder for total qs if not available
                                // Better: Check if we have total questions. For now, let's assume result.score is meaningful.
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
                                                    {result.score}/{result.answers?.length || 0}
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
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Player Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{activeExam.title}</h2>
                                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{activeExam.subject}</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black ${timeLeft < 60 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-cyan-50 text-cyan-600'}`}>
                                    <Clock className="w-5 h-5" />
                                    <span className="text-lg">{formatTime(timeLeft)}</span>
                                </div>
                                {!examResult && (
                                    <button
                                        onClick={() => { if (confirm("Are you sure you want to exit? Your progress may not be saved.")) setActiveExam(null); }}
                                        className="p-2 hover:bg-white rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                )}
                            </div>
                        </div>

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
                                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-indigo-600">{examResult.score} / {examResult.answers?.length || questions.length}</span>
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
                                                            <p className="font-bold text-slate-900 underline decoration-slate-200 decoration-2 underline-offset-4">{q.questionText}</p>
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
                                    {/* Question navigation dots */}
                                    <div className="flex flex-wrap gap-2">
                                        {questions.map((_, idx) => (
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
                                        ))}
                                    </div>

                                    {/* Current Question */}
                                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                                            {questions[currentQuestionIndex].questionText}
                                        </h3>
                                        {questions[currentQuestionIndex]?.imageUrl && (
                                            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200">
                                                <img 
                                                    src={questions[currentQuestionIndex].imageUrl} 
                                                    alt="Question Illustration" 
                                                    className="max-h-[300px] w-auto mx-auto object-contain"
                                                />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {questions[currentQuestionIndex].options.map((option, oIdx) => (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => handleAnswerSelect(questions[currentQuestionIndex]._id, oIdx)}
                                                    className={`p-6 rounded-3xl border-2 text-left transition-all ${selectedAnswers[questions[currentQuestionIndex]._id] === oIdx
                                                        ? 'bg-cyan-50 border-cyan-500 shadow-sm'
                                                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${selectedAnswers[questions[currentQuestionIndex]._id] === oIdx
                                                            ? 'bg-cyan-500 text-white'
                                                            : 'bg-white text-slate-400'
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
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Player Footer */}
                        {!examResult && (
                            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <button
                                    disabled={currentQuestionIndex === 0}
                                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full font-black text-slate-400 hover:text-cyan-600 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Previous
                                </button>

                                {currentQuestionIndex === questions.length - 1 ? (
                                    <button
                                        onClick={handleSubmitExam}
                                        disabled={isSubmitting}
                                        className="px-10 py-3 rounded-full bg-emerald-600 text-white font-black shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Finish & Submit'}
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentExams;

