import React, { useState, useEffect } from 'react';
import { Award, PlusCircle, User, BookOpen, Clock, CheckCircle2, AlertCircle, X, Search, Filter, Plus, Trash2, ChevronRight, ChevronLeft, Image as ImageIcon, Loader2, Users, BarChart2, TrendingUp, MoreVertical, Edit2 } from 'lucide-react';
import { createBulkExam, deleteExam, updateBulkExam, getQuestions, getAdminExams, getAdminClassrooms, getExamDetails, submitAdminResult, uploadImage, saveDraftQuestion, getDraftQuestions, updateQuestion, publishQuestion, deleteQuestion } from '../../../api/services';

const ExamsManagement = () => {
    const [exams, setExams] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [examDetails, setExamDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [resultSearchQuery, setResultSearchQuery] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        classLevel: '10',
        date: '',
        duration: 90,
        totalMarks: 100,
        classroom: '',
        examCategory: 'scheduled',
        examType: 'subject-wise',
        questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', imageUrl: '' }]
    });

    // Form for results
    const [resultData, setResultData] = useState({
        studentId: '',
        marksObtained: '',
        remarks: ''
    });

    const [activeMenu, setActiveMenu] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingExamId, setEditingExamId] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [draftQuestions, setDraftQuestions] = useState([]);
    const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (formData.classroom) {
            fetchDraftQuestions(formData.classroom);
        }
    }, [formData.classroom]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [examData, classData] = await Promise.all([
                getAdminExams().catch(() => []),
                getAdminClassrooms().catch(() => [])
            ]);
            setExams(Array.isArray(examData) ? examData : []);
            setClassrooms(Array.isArray(classData) ? classData : []);
            if (Array.isArray(classData) && classData.length > 0) {
                const defaultClassroomId = classData[0]._id;
                setFormData(prev => ({ ...prev, classroom: defaultClassroomId }));
                await fetchDraftQuestions(defaultClassroomId);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDraftQuestions = async (classroomId = formData.classroom) => {
        setIsLoadingDrafts(true);
        try {
            if (!classroomId) {
                setDraftQuestions([]);
                return;
            }
            const params = { classroom: classroomId };
            const { data } = await getDraftQuestions(params);
            setDraftQuestions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching draft questions:", error);
        } finally {
            setIsLoadingDrafts(false);
        }
    };

    const handleSaveExamDraft = async () => {
        if (!formData.questions || !formData.questions.length) {
            setStatus({ type: 'error', message: 'Add one or more questions before saving draft.' });
            return;
        }

        setIsSavingDraft(true);
        try {
            await Promise.all(formData.questions.map((q) =>
                saveDraftQuestion({
                    exam: null,
                    classroom: formData.classroom,
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    imageUrl: q.imageUrl || '',
                    status: 'draft',
                })
            ));
            setStatus({ type: 'success', message: 'Questions saved as draft successfully.' });
            fetchDraftQuestions();
        } catch (error) {
            console.error('Error saving draft questions:', error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to save exam draft.' });
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handleLoadDraftQuestion = (draft) => {
        setCurrentStep(2);
        setFormData(prev => ({
            ...prev,
            questions: [{
                questionText: draft.questionText,
                options: draft.options,
                correctAnswer: draft.correctAnswer,
                explanation: draft.explanation,
                imageUrl: draft.imageUrl || '',
                _id: draft._id,
            }],
        }));
        setStatus({ type: 'success', message: 'Draft loaded. You can edit and publish.' });
    };

    const handleDeleteDraftQuestion = async (draftId) => {
        if (!window.confirm('Delete draft question?')) return;
        try {
            await deleteQuestion(draftId);
            fetchDraftQuestions();
            setStatus({ type: 'success', message: 'Draft deleted.' });
        } catch (error) {
            console.error('Error deleting draft question:', error);
            setStatus({ type: 'error', message: 'Failed to delete draft.' });
        }
    };


    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateBulkExam(editingExamId, formData);
                setStatus({ type: 'success', message: 'Exam updated successfully!' });
            } else {
                await createBulkExam(formData);
                setStatus({ type: 'success', message: 'Exam created successfully with questions!' });
            }
            setIsModalOpen(false);
            resetForm();
            fetchData();
            fetchDraftQuestions();

        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to process exam.' });
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subject: '',
            classLevel: '10',
            date: '',
            duration: 90,
            totalMarks: 100,
            classroom: classrooms[0]?._id || '',
            examCategory: 'scheduled',
            examType: 'subject-wise',
            questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', imageUrl: '' }]
        });
        setIsEditing(false);
        setEditingExamId(null);
    };

    const openEditModal = async (exam) => {
        try {
            setLoading(true);
            const questRes = await getQuestions(exam._id);
            setFormData({
                title: exam.title,
                subject: exam.subject,
                classLevel: exam.classLevel,
                date: exam.date ? new Date(exam.date).toISOString().slice(0, 16) : '',
                duration: exam.duration,
                totalMarks: exam.totalMarks,
                classroom: exam.classroom._id,
                examCategory: exam.examCategory || 'scheduled',
                examType: exam.examType || 'subject-wise',
                questions: questRes.data.length > 0 ? questRes.data : [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', imageUrl: '' }]
            });
            setIsEditing(true);
            setEditingExamId(exam._id);
            setIsModalOpen(true);
            setCurrentStep(1);
            setActiveMenu(null);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to load exam questions for editing.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm("Are you sure you want to delete this exam? This action cannot be undone.")) return;
        try {
            await deleteExam(examId);
            setStatus({ type: 'success', message: 'Exam deleted successfully.' });
            fetchData();
            setActiveMenu(null);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to delete exam.' });
        }
    };

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', imageUrl: '' }]
        });
    };

    const removeQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const [uploadingImage, setUploadingImage] = useState(null);

    const handleImageUpload = async (index, file) => {
        if (!file) return;
        setUploadingImage(index);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        try {
            const data = await uploadImage(formDataUpload);
            handleQuestionChange(index, 'imageUrl', data.url);
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(null);
        }
    };

    const fetchExamDetails = async (examId) => {
        try {
            setLoadingDetails(true);
            setIsDetailModalOpen(true);
            const data = await getExamDetails(examId);
            setExamDetails(data);
        } catch (error) {
            console.error("Error fetching exam details:", error);
            setStatus({ type: 'error', message: 'Failed to load exam details.' });
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleResultSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitAdminResult({
                examId: selectedExam._id,
                ...resultData
            });
            setStatus({ type: 'success', message: 'Marks submitted successfully!' });
            setResultData({ studentId: '', marksObtained: '', remarks: '' });
        } catch (error) {
            setStatus({ type: 'error', message: error || 'Failed to submit marks.' });
        }
    };

    const openResultModal = (exam) => {
        setSelectedExam(exam);
        const classroom = classrooms.find(c => c._id === exam.classroom._id);
        setSelectedClassroom(classroom);
        setResultData(prev => ({ ...prev, studentId: classroom?.students[0]?._id || '' }));
        setIsResultModalOpen(true);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Exams & Results</h1>
                    <p className="text-slate-500 mt-2">Manage academic exams and manual marks entry.</p>
                </div>
                <button 
                    onClick={() => {
                        setIsModalOpen(true);
                        setCurrentStep(1);
                    }}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Create Exam</span>
                </button>
            </div>

            {status.message && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span>{status.message}</span>
                    <button onClick={() => setStatus({type:'', message:''})} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : exams.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">No Exams Scheduled</h3>
                    <p className="text-slate-400 mt-1">Start by clicking the "Create Exam" button.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam) => (
                        <div key={exam._id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group overflow-hidden">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                     <Award className="w-6 h-6" />
                                 </div>
                                 <div className="flex gap-1">
                                    <div className="text-right mr-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{exam.subject}</span>
                                        <p className="text-sm font-bold text-indigo-600">Class {exam.classLevel}</p>
                                    </div>
                                    <div className="relative">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === exam._id ? null : exam._id);
                                            }}
                                            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                        
                                        {activeMenu === exam._id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                                <button 
                                                    onClick={() => openEditModal(exam)}
                                                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                                                >
                                                    <Edit2 className="w-4 h-4 text-indigo-500" />
                                                    Edit Exam
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteExam(exam._id)}
                                                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-3"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete Exam
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                 </div>
                             </div>
                             <h3 className="text-xl font-bold text-slate-800 mb-2">{exam.title}</h3>
                             <div className="space-y-2 mb-6">
                                 <div className="flex items-center text-sm text-slate-500 gap-2">
                                     <Clock className="w-4 h-4" />
                                     <span>{new Date(exam.date).toLocaleDateString()} • {exam.duration} Mins</span>
                                 </div>
                                 <div className="flex items-center text-sm text-slate-500 gap-2">
                                     <BookOpen className="w-4 h-4" />
                                     <span>{exam.classroom?.name || 'No Classroom'} • {exam.totalMarks} Marks</span>
                                 </div>
                             </div>
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => fetchExamDetails(exam._id)}
                                    className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                                >
                                    <BarChart2 className="w-4 h-4" /> 
                                    View Report
                                </button>
                                <button 
                                    onClick={() => openResultModal(exam)}
                                    className="p-2.5 bg-slate-50 text-slate-400 font-bold rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
                                    title="Add Manual Result"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                             </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Exam Detail Modal (Dashboard) */}
            {isDetailModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-slate-50 rounded-[2.5rem] w-full max-w-5xl shadow-2xl animate-in zoom-in-95 duration-200 my-8 overflow-hidden border border-white/20">
                        {loadingDetails ? (
                            <div className="flex flex-col items-center justify-center py-40 space-y-4">
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                <p className="text-slate-500 font-medium">Generating exam analytics...</p>
                            </div>
                        ) : examDetails && (
                            <div className="flex flex-col h-full max-h-[90vh]">
                                {/* Modal Header */}
                                <div className="bg-white p-6 md:p-8 border-b border-slate-100 flex justify-between items-start shrink-0">
                                    <div className="flex gap-5 items-center">
                                        <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-100">
                                            <Award className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider">{examDetails.subject}</span>
                                                <span className="text-xs text-slate-400 font-bold">• Class {examDetails.classLevel}</span>
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black text-slate-900">{examDetails.title}</h2>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-2xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                                </div>

                                {/* Modal Content - Scrollable */}
                                <div className="overflow-y-auto p-6 md:p-8 space-y-8 flex-1 custom-scrollbar">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-white p-5 rounded-3xl border border-white shadow-sm flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-6 h-6" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
                                                <p className="text-xl font-black text-slate-900">{examDetails.stats.attendedCount} / {examDetails.stats.totalStudents}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white p-5 rounded-3xl border border-white shadow-sm flex items-center gap-4">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pass Rate</p>
                                                <p className="text-xl font-black text-slate-900">{Math.round((examDetails.results.filter(r => (r.marksObtained/examDetails.totalMarks) >= 0.4).length / (examDetails.results.length || 1)) * 100)}%</p>
                                            </div>
                                        </div>
                                        <div className="bg-white p-5 rounded-3xl border border-white shadow-sm flex items-center gap-4">
                                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Award className="w-6 h-6" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Score</p>
                                                <p className="text-xl font-black text-slate-900">{Math.round(examDetails.results.reduce((acc, r) => acc + (r.marksObtained || 0), 0) / (examDetails.results.length || 1))}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white p-5 rounded-3xl border border-white shadow-sm flex items-center gap-4">
                                            <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                                                <p className="text-xl font-black text-slate-900">{examDetails.duration}m</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Results & Rankings */}
                                    <div className="bg-white rounded-[2rem] border border-white shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                                Student Rankings & Detailed Scores
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Search student..." 
                                                        value={resultSearchQuery}
                                                        onChange={(e) => setResultSearchQuery(e.target.value)}
                                                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-48" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50/50">
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rank</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Score</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Percentage</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Taken</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 text-sm">
                                                    {examDetails.results
                                                        .filter(r => r.student?.name?.toLowerCase().includes(resultSearchQuery.toLowerCase()))
                                                        .map((result, idx) => {
                                                        const percentage = Math.round((result.marksObtained / examDetails.totalMarks) * 100);
                                                        return (
                                                            <tr key={result._id} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-6 py-4 font-black text-slate-900">
                                                                    {idx === 0 ? <span className="flex items-center gap-1.5 text-amber-500"><Award className="w-4 h-4" /> 1st</span> : 
                                                                     idx === 1 ? <span className="flex items-center gap-1.5 text-slate-400"><Award className="w-4 h-4" /> 2nd</span> :
                                                                     idx === 2 ? <span className="flex items-center gap-1.5 text-orange-400"><Award className="w-4 h-4" /> 3rd</span> : 
                                                                     `#${idx + 1}`}
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-900 font-bold">{result.student?.name}</td>
                                                                <td className="px-6 py-4 text-center font-black text-indigo-600">{result.marksObtained} / {examDetails.totalMarks}</td>
                                                                <td className="px-6 py-4 text-center font-bold text-slate-600">{percentage}%</td>
                                                                <td className="px-6 py-4 text-slate-500">{result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : 'N/A'}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${percentage >= 40 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                        {percentage >= 40 ? 'Passed' : 'Failed'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    {examDetails.results.length === 0 && (
                                                        <tr>
                                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">No results submitted yet for this exam.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Questions Review Preview */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-indigo-600" />
                                            Exam Questions Review ({examDetails.questions.length})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {examDetails.questions.map((q, qidx) => (
                                                <div key={q._id} className="bg-white p-5 rounded-3xl border border-white shadow-sm space-y-3">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Question {qidx + 1}</p>
                                                    <p className="text-sm font-bold text-slate-900 leading-relaxed line-clamp-2">{q.questionText}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">Correct: Option {String.fromCharCode(65 + q.correctAnswer)}</span>
                                                        {q.imageUrl && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">Has Image</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {isEditing ? 'Edit Exam' : (currentStep === 1 ? 'Step 1: Exam Details' : 'Step 2: Add Questions')}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium">
                                    {isEditing ? `Modifying ${formData.title}` : (currentStep === 1 ? 'Configure basic exam settings' : 'Create MCQ questions for the exam')}
                                </p>
                            </div>
                            <button onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                        </div>

                        <form onSubmit={handleCreateExam} className="space-y-6">
                            {currentStep === 1 ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Exam Title</label>
                                        <input name="title" value={formData.title} onChange={(e)=>setFormData({...formData, title:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="Unit Test 1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Subject</label>
                                        <input name="subject" value={formData.subject} onChange={(e)=>setFormData({...formData, subject:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="Mathematics" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Classroom</label>
                                        <select name="classroom" value={formData.classroom} onChange={(e)=>setFormData({...formData, classroom:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                            {classrooms.map(c => <option key={c._id} value={c._id}>{c.name} ({c.className} {c.board})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Exam Category</label>
                                        <select name="examCategory" value={formData.examCategory} onChange={(e)=>setFormData({...formData, examCategory:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                            <option value="scheduled">Scheduled Exam</option>
                                            <option value="practice">Practice Exam</option>
                                        </select>
                                    </div>
                                    {formData.examCategory === 'practice' && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Practice Type</label>
                                            <select name="examType" value={formData.examType} onChange={(e)=>setFormData({...formData, examType:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                                <option value="subject-wise">Subject-wise</option>
                                                <option value="mock">Full Mock</option>
                                            </select>
                                        </div>
                                    )}
                                    {formData.examCategory === 'scheduled' && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Date</label>
                                            <input type="datetime-local" name="date" value={formData.date} onChange={(e)=>setFormData({...formData, date:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Duration (Mins)</label>
                                        <input type="number" name="duration" value={formData.duration} onChange={(e)=>setFormData({...formData, duration:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Total Marks</label>
                                        <input type="number" name="totalMarks" value={formData.totalMarks} onChange={(e)=>setFormData({...formData, totalMarks:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                    </div>
                                    <div className="col-span-2 pt-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setCurrentStep(2)}
                                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                        >
                                            Next: Add Questions <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <h4 className="text-sm font-semibold text-slate-700">Draft Actions</h4>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleSaveExamDraft}
                                                disabled={isSavingDraft}
                                                className="px-3 py-2 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                                            >
                                                {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={fetchDraftQuestions}
                                                disabled={isLoadingDrafts}
                                                className="px-3 py-2 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                                            >
                                                {isLoadingDrafts ? 'Loading...' : 'Refresh Drafts'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-56 overflow-y-auto">
                                        {draftQuestions.length === 0 ? (
                                            <p className="text-xs text-slate-500">No drafts available for this classroom.</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {draftQuestions.map((draft) => (
                                                    <li key={draft._id} className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-700 truncate">{draft.questionText || 'Untitled question'}</span>
                                                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Draft</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button type="button" onClick={() => handleLoadDraftQuestion(draft)}
                                                                className="text-[10px] text-cyan-600 font-bold rounded px-2 py-1 border border-cyan-200 hover:bg-cyan-50">Load</button>
                                                            <button type="button" onClick={() => handleDeleteDraftQuestion(draft._id)}
                                                                className="text-[10px] text-rose-600 font-bold rounded px-2 py-1 border border-rose-200 hover:bg-rose-50">Delete</button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">MCQ Questions ({formData.questions.length})</h3>
                                        <button 
                                            type="button" 
                                            onClick={addQuestion}
                                            className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all"
                                        >
                                            <Plus className="w-4 h-4" /> Add Question
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {formData.questions.map((q, qIndex) => (
                                            <div key={qIndex} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative group">
                                                {formData.questions.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeQuestion(qIndex)}
                                                        className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <div className="flex gap-4 items-start">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Question {qIndex + 1}</label>
                                                        <textarea 
                                                            value={q.questionText} 
                                                            onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                                                            placeholder="Enter question here..."
                                                            required
                                                        />
                                                    </div>
                                                    <div className="w-32 flex flex-col items-center gap-2">
                                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Image</label>
                                                        <div className="relative group/img w-full aspect-square bg-white border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                                                            {q.imageUrl ? (
                                                                <>
                                                                    <img src={q.imageUrl} alt="Question" className="w-full h-full object-cover" />
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={() => handleQuestionChange(qIndex, 'imageUrl', '')}
                                                                        className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                                                                    >
                                                                        <Trash2 className="w-5 h-5 text-white" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <label className="cursor-pointer flex flex-col items-center gap-1">
                                                                    {uploadingImage === qIndex ? (
                                                                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <ImageIcon className="w-6 h-6 text-slate-400" />
                                                                            <span className="text-[10px] font-bold text-slate-400">UPLOAD</span>
                                                                        </>
                                                                    )}
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        className="hidden" 
                                                                        onChange={(e) => handleImageUpload(qIndex, e.target.files[0])}
                                                                        disabled={uploadingImage === qIndex}
                                                                    />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {q.options.map((option, oIndex) => (
                                                        <div key={oIndex} className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`correct-${qIndex}`} 
                                                                    checked={q.correctAnswer === oIndex}
                                                                    onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                                                    className="accent-indigo-600 w-4 h-4"
                                                                />
                                                                <input 
                                                                    value={option} 
                                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Explanation (Optional)</label>
                                                    <input 
                                                        value={q.explanation} 
                                                        onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                        placeholder="Explain why the answer is correct..."
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                                        <button 
                                            type="button" 
                                            onClick={() => setCurrentStep(1)} 
                                            className="flex-1 py-3.5 text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ChevronLeft className="w-5 h-5" /> Back
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="flex-[2] py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                        >
                                            Create Exam
                                        </button>
                                    </div>
                                </div>
                            </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Enter Results Modal */}
            {isResultModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Enter Results</h2>
                                <p className="text-sm text-slate-500 font-medium">{selectedExam.title} - {selectedExam.subject}</p>
                            </div>
                            <button onClick={() => setIsResultModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleResultSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Select Student</label>
                                <select name="studentId" value={resultData.studentId} onChange={(e)=>setResultData({...resultData, studentId:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                    {selectedClassroom?.students?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Marks Obtained (Max {selectedExam.totalMarks})</label>
                                <input type="number" max={selectedExam.totalMarks} name="marksObtained" value={resultData.marksObtained} onChange={(e)=>setResultData({...resultData, marksObtained:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="85" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Remarks</label>
                                <input name="remarks" value={resultData.remarks} onChange={(e)=>setResultData({...resultData, remarks:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Excellent performance!" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsResultModalOpen(false)} className="flex-1 py-3.5 text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Close</button>
                                <button type="submit" className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Submit Marks</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamsManagement;
