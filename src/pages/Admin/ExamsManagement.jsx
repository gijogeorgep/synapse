 import React, { useState, useEffect } from 'react';
 import axios from 'axios';
 import { Award, PlusCircle, User, BookOpen, Clock, CheckCircle2, AlertCircle, X, Search, Filter, Plus, Trash2, ChevronRight, ChevronLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
 import { createBulkExam } from '../../api/services';

const ExamsManagement = () => {
    const [exams, setExams] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    
    // Form for creating an exam
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        classLevel: '10',
        date: '',
        duration: 90,
        totalMarks: 100,
        classroom: '',
        questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', imageUrl: '' }]
    });

    // Form for results
    const [resultData, setResultData] = useState({
        studentId: '',
        marksObtained: '',
        remarks: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const [examRes, classRes] = await Promise.all([
                axios.get('/api/admin/exams', config),
                axios.get('/api/admin/classrooms', config)
            ]);
            setExams(examRes.data);
            setClassrooms(classRes.data);
            if (classRes.data.length > 0) {
                setFormData(prev => ({ ...prev, classroom: classRes.data[0]._id }));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            await createBulkExam(formData);
            setStatus({ type: 'success', message: 'Exam created successfully with questions!' });
            setIsModalOpen(false);
            setFormData({
                title: '',
                subject: '',
                classLevel: '10',
                date: '',
                duration: 90,
                totalMarks: 100,
                classroom: classrooms[0]?._id || '',
                questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', imageUrl: '' }]
            });
            fetchData();
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to create exam.' });
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
            const config = { 
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}` 
                } 
            };
            const response = await axios.post('/api/upload/image', formDataUpload, config);
            handleQuestionChange(index, 'imageUrl', response.data.url);
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(null);
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
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/admin/results', {
                examId: selectedExam._id,
                ...resultData
            }, config);
            setStatus({ type: 'success', message: 'Marks submitted successfully!' });
            setResultData({ studentId: '', marksObtained: '', remarks: '' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to submit marks.' });
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
                                 <div className="text-right">
                                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{exam.subject}</span>
                                     <p className="text-sm font-bold text-indigo-600">Class {exam.classLevel}</p>
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
                             <button 
                                onClick={() => openResultModal(exam)}
                                className="w-full py-2.5 bg-slate-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all border border-indigo-100"
                             >
                                 Enter Results
                             </button>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {currentStep === 1 ? 'Step 1: Exam Details' : 'Step 2: Add Questions'}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium">
                                    {currentStep === 1 ? 'Configure basic exam settings' : 'Create MCQ questions for the exam'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
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
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Date</label>
                                        <input type="datetime-local" name="date" value={formData.date} onChange={(e)=>setFormData({...formData, date:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                    </div>
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
