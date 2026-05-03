import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, Users, GraduationCap, Mail, AlertCircle,
    PlusCircle, Upload, FileText, Loader2, CheckCircle2, X, Trash2,
    Image as ImageIcon, ChevronDown, ChevronUp, Eye, Send
} from 'lucide-react';
import { 
    getAdminClassrooms, 
    uploadImage, 
    uploadFile, 
    createBulkExam, 
    updateClassroomResources 
} from '../../../api/services';

const EMPTY_QUESTION = () => ({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    imageUrl: '',
});

const AdminClassroomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('students');
    const [status, setStatus] = useState({ type: '', message: '' });

    // Exam builder state
    const [examMeta, setExamMeta] = useState({ title: '', description: '', duration: 60, subject: '', marksPerQuestion: 1, negativeMarks: 0, examType: 'subject-wise' });
    const [showPreview, setShowPreview] = useState(false);
    const [questions, setQuestions] = useState([EMPTY_QUESTION()]);
    const [isCreatingExam, setIsCreatingExam] = useState(false);
    const [expandedQ, setExpandedQ] = useState(0);
    const [uploadingImg, setUploadingImg] = useState({}); // { [qIdx]: true|false }

    // Study material form
    const [materialForm, setMaterialForm] = useState({ title: '', url: '', subject: '' });
    const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);

    // Class links management
    const [classLinks, setClassLinks] = useState([]);
    const [isUpdatingLinks, setIsUpdatingLinks] = useState(false);
    const [newLink, setNewLink] = useState({ title: '', url: '', subject: '' });

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    useEffect(() => { fetchClassroomDetails(); }, [id]);

    const fetchClassroomDetails = async () => {
        try {
            setLoading(true);
            const data = await getAdminClassrooms();
            const found = data.find(c => c._id === id);
            if (found) {
                setClassroom(found);
                setClassLinks(found.classLinks || []);
                if (found.subjects && found.subjects.length > 0) {
                    setMaterialForm(prev => ({ ...prev, subject: found.subjects[0] }));
                    setNewLink(prev => ({ ...prev, subject: found.subjects[0] }));
                }
            }
            else setError('Classroom not found.');
        } catch (err) {
            setError('Failed to load classroom details.');
        } finally {
            setLoading(false);
        }
    };

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

    const validateExamBuilder = () => {
        if (!examMeta.title.trim()) {
            showStatus('error', 'Exam title is required.');
            return false;
        }

        if (!examMeta.subject.trim()) {
            showStatus('error', 'Subject is required.');
            return false;
        }

        if (!examMeta.duration || Number(examMeta.duration) < 5) {
            showStatus('error', 'Duration must be at least 5 minutes.');
            return false;
        }

        if (!examMeta.marksPerQuestion || Number(examMeta.marksPerQuestion) < 1) {
            showStatus('error', 'Marks per question must be at least 1.');
            return false;
        }

        if (examMeta.negativeMarks < 0) {
            showStatus('error', 'Negative mark cannot be less than 0.');
            return false;
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            showStatus('error', 'Add at least one question before publishing.');
            return false;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText.trim()) {
                showStatus('error', `Question ${i + 1} is missing text.`);
                setExpandedQ(i);
                return false;
            }
            if (q.options.some(o => !o.trim())) {
                showStatus('error', `All 4 options in question ${i + 1} must be filled.`);
                setExpandedQ(i);
                return false;
            }
            if (q.correctAnswer < 0 || q.correctAnswer > 3) {
                showStatus('error', `Question ${i + 1} needs one correct answer selected.`);
                setExpandedQ(i);
                return false;
            }
        }

        return true;
    };

    // ─── Question Helpers ─────────────────────────────────────────
    const updateQuestion = (idx, field, value) => {
        setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
    };

    const updateOption = (qIdx, oIdx, value) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIdx) return q;
            const opts = [...q.options];
            opts[oIdx] = value;
            return { ...q, options: opts };
        }));
    };

    const addQuestion = () => {
        setQuestions(prev => [...prev, EMPTY_QUESTION()]);
        setExpandedQ(questions.length);
    };

    const removeQuestion = (idx) => {
        if (questions.length === 1) return;
        setQuestions(prev => prev.filter((_, i) => i !== idx));
        setExpandedQ(Math.max(0, idx - 1));
    };

    const uploadQuestionImage = async (qIdx, file) => {
        if (!file) return;
        setUploadingImg(prev => ({ ...prev, [qIdx]: true }));
        try {
            const formData = new FormData();
            formData.append('image', file);
            const data = await uploadImage(formData);
            updateQuestion(qIdx, 'imageUrl', data.url);
        } catch (err) {
            showStatus('error', 'Image upload failed. Please try again.');
        } finally {
            setUploadingImg(prev => ({ ...prev, [qIdx]: false }));
        }
    };

    // ─── Submit Exam ──────────────────────────────────────────────
    const handleCreateExam = async (e) => {
        e.preventDefault();
        if (!validateExamBuilder()) {
            return;
        }

        setIsCreatingExam(true);
        try {
            await createBulkExam({
                title: examMeta.title,
                description: examMeta.description,
                duration: examMeta.duration,
                subject: examMeta.subject || classroom?.type || 'General',
                classLevel: classroom?.className || '12',
                examType: examMeta.examType,
                classroom: id,
                // Set date to 5 mins ago so it's immediately "started" for students
                date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                totalMarks: questions.length * (examMeta.marksPerQuestion || 1),
                marksPerQuestion: examMeta.marksPerQuestion,
                negativeMarks: examMeta.negativeMarks,
                questions: questions.map(q => ({
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    imageUrl: q.imageUrl || undefined,
                })),
            });

            showStatus('success', 'Exam has been created successfully.');
            setExamMeta({ title: '', description: '', duration: 60, subject: '', marksPerQuestion: 1, negativeMarks: 0, examType: 'subject-wise' });
            setQuestions([EMPTY_QUESTION()]);
            setExpandedQ(0);
            setShowPreview(false);
        } catch (err) {
            showStatus('error', err.response?.data?.message || 'Failed to create exam.');
        } finally {
            setIsCreatingExam(false);
        }
    };

    // ─── Study Material ───────────────────────────────────────────
    const [uploadingMaterialFile, setUploadingMaterialFile] = useState(false);

    const handleMaterialFileChange = async (file) => {
        if (!file) return;
        setUploadingMaterialFile(true);
        try {
            const formData = new FormData();
            formData.append(file.type.includes('image') ? 'image' : 'file', file);
            const data = await (file.type.includes('image') ? uploadImage(formData) : uploadFile(formData));
            setMaterialForm(prev => ({ ...prev, url: data.url }));
            showStatus('success', 'File uploaded to Cloudinary! Now give it a title and save.');
        } catch (err) {
            showStatus('error', 'File upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploadingMaterialFile(false);
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        if (!materialForm.url) { showStatus('error', 'Please upload a file first.'); return; }
        setIsUploadingMaterial(true);
        try {
            await updateClassroomResources(id, {
                lectureNote: { 
                    title: materialForm.title, 
                    url: materialForm.url,
                    subject: materialForm.subject 
                }
            });
            showStatus('success', 'Study material saved!');
            setMaterialForm({ title: '', url: '', subject: classroom?.subjects?.[0] || '' });
            fetchClassroomDetails();
        } catch (err) {
            showStatus('error', err.response?.data?.message || 'Failed to save material.');
        } finally {
            setIsUploadingMaterial(false);
        }
    };

    const handleAddLink = async () => {
        if (!newLink.title || !newLink.url) {
            showStatus('error', 'Title and URL are required.');
            return;
        }
        setIsUpdatingLinks(true);
        try {
            const updatedLinks = [...classLinks, newLink];
            await updateClassroomResources(id, { classLinks: updatedLinks });
            setClassLinks(updatedLinks);
            setNewLink({ title: '', url: '', subject: classroom?.subjects?.[0] || '' });
            showStatus('success', 'Class link added!');
            fetchClassroomDetails();
        } catch (err) {
            showStatus('error', 'Failed to add link.');
        } finally {
            setIsUpdatingLinks(false);
        }
    };

    const handleRemoveLink = async (index) => {
        setIsUpdatingLinks(true);
        try {
            const updatedLinks = classLinks.filter((_, i) => i !== index);
            await updateClassroomResources(id, { classLinks: updatedLinks });
            setClassLinks(updatedLinks);
            showStatus('success', 'Link removed!');
            fetchClassroomDetails();
        } catch (err) {
            showStatus('error', 'Failed to remove link.');
        } finally {
            setIsUpdatingLinks(false);
        }
    };

    // ─── Loading / Error ──────────────────────────────────────────
    if (loading) return (
        <div className="flex justify-center items-center h-full min-h-[400px]">
            <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
        </div>
    );

    if (error || !classroom) return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto mt-12 text-center">
            <AlertCircle className="w-16 h-16 text-rose-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{error || "Classroom details unavailable"}</h2>
            <button onClick={() => navigate('/admin/classrooms')} className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
        </div>
    );

    const isPublicBatch = ['NEET', 'JEE', 'PSC'].includes(classroom.type);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-4 md:p-8">

            {/* Header */}
            <div className="flex items-start space-x-4">
                <button onClick={() => navigate('/admin/classrooms')} className="p-2.5 mt-1 bg-white text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl shadow-sm border border-slate-200 hover:border-cyan-200 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-slate-900">{classroom.name}</h1>
                        <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-bold rounded-full border border-cyan-200">Class {classroom.className}</span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full border border-indigo-200">{classroom.board}</span>
                        {isPublicBatch && <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full border border-rose-200">{classroom.type} Batch</span>}
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                        {isPublicBatch ? `Manage NEET/JEE/PSC batch — create exams and upload study materials.` : 'Manage teachers, students and resources.'}
                    </p>
                </div>
            </div>

            {/* Status Toast */}
            {status.message && (
                <div className="fixed top-6 right-6 z-[140] max-w-md animate-in slide-in-from-top-3 fade-in duration-200">
                    <div className={`p-4 rounded-2xl flex items-start gap-3 shadow-2xl border backdrop-blur-sm ${status.type === 'success' ? 'bg-emerald-50/95 text-emerald-700 border-emerald-100' : 'bg-rose-50/95 text-rose-700 border-rose-100'}`}>
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                        <p className="font-medium text-sm pr-2">{status.message}</p>
                        <button type="button" onClick={() => setStatus({ type: '', message: '' })} className="ml-auto"><X className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-5">
                {[
                    { icon: GraduationCap, label: 'Students', val: classroom.students?.length || 0, color: 'blue' },
                    { icon: FileText, label: 'Study Materials', val: classroom.lectureNotes?.length || 0, color: 'emerald' },
                    { icon: Users, label: 'Teachers', val: classroom.teachers?.length || 0, color: 'indigo' },
                ].map(({ icon: Icon, label, val, color }) => (
                    <div key={label} className={`bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden group`}>
                        <div className={`absolute -right-3 -top-3 w-16 h-16 bg-${color}-50 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
                        <div className={`w-12 h-12 bg-${color}-100 text-${color}-600 rounded-2xl flex items-center justify-center shrink-0 relative z-10`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                            <h3 className="text-2xl font-black text-slate-800">{val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-fit flex-wrap">
                {[
                    { key: 'students', label: 'Students', icon: GraduationCap },
                    { key: 'exams', label: 'Create Exam (MCQ)', icon: FileText },
                    { key: 'materials', label: 'Study Materials', icon: Upload },
                    { key: 'links', label: 'Class Links', icon: Eye },
                ].map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === key ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </div>

            {/* ── STUDENTS TAB ── */}
            {activeTab === 'students' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enrolled Students */}
                    <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ring-1 ring-slate-900/5 ${isPublicBatch ? 'lg:col-span-2' : ''}`}>
                        <div className="p-5 border-b border-slate-100 bg-blue-50/30 flex items-center space-x-3">
                            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl"><GraduationCap className="w-5 h-5" /></div>
                            <h2 className="text-lg font-bold text-slate-800">Enrolled Students</h2>
                            <span className="ml-auto text-xs font-bold text-slate-400">{classroom.students?.length || 0} total</span>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[460px]">
                            {!classroom.students?.length ? (
                                <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                                    <GraduationCap className="w-10 h-10 text-slate-200 mb-2" />
                                    <p className="text-slate-400 text-sm font-medium">No students enrolled yet.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {classroom.students.map((s, i) => (
                                        <li key={s._id || i} className="p-5 hover:bg-slate-50/50 transition-colors flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                                                {s.name?.[0]?.toUpperCase() || 'S'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-800 truncate">{s.name || 'Unknown'}</h4>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                    <Mail className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{s.email || '—'}</span>
                                                </div>
                                            </div>
                                            {s.uniqueId && <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{s.uniqueId}</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Teachers (Hidden for NEET/JEE/PSC) */}
                    {!isPublicBatch && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ring-1 ring-slate-900/5">
                            <div className="p-5 border-b border-slate-100 bg-indigo-50/30 flex items-center space-x-3">
                                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl"><Users className="w-5 h-5" /></div>
                                <h2 className="text-lg font-bold text-slate-800">Assigned Teachers</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[460px]">
                                {!classroom.teachers?.length ? (
                                    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                                        <Users className="w-10 h-10 text-slate-200 mb-2" />
                                        <p className="text-slate-400 text-sm font-medium">No teachers assigned yet.</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-slate-100">
                                        {classroom.teachers.map((t, i) => (
                                            <li key={t._id || i} className="p-5 hover:bg-slate-50/50 transition-colors flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                                                    {t.name?.[0]?.toUpperCase() || 'T'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-800 truncate">{t.name || 'Unknown'}</h4>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                        <Mail className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{t.email || '—'}</span>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg border border-indigo-100">Teacher</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── CREATE EXAM TAB ── */}
            {activeTab === 'exams' && (
                <form onSubmit={handleCreateExam} noValidate className="space-y-6 max-w-3xl">
                    {/* Exam Meta */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl"><FileText className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Exam Details</h2>
                                <p className="text-xs text-slate-400">Students can attempt this exam anytime — no scheduling required.</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Exam Title <span className="text-rose-500">*</span></label>
                            <input value={examMeta.title} onChange={e => setExamMeta({ ...examMeta, title: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                                placeholder="e.g. NEET Full Mock Test 1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject <span className="text-rose-500">*</span></label>
                                <input value={examMeta.subject} onChange={e => setExamMeta({ ...examMeta, subject: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                                    placeholder="e.g. Biology, Physics, All Subjects" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Exam Category <span className="text-rose-500">*</span></label>
                                <select value={examMeta.examType} onChange={e => setExamMeta({ ...examMeta, examType: e.target.value, subject: e.target.value === 'mock' ? 'Full Course Mock' : examMeta.subject })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none font-bold text-slate-700">
                                    <option value="subject-wise">Subject-wise Test</option>
                                    <option value="mock">Full Mock Test</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (mins) <span className="text-rose-500">*</span></label>
                                <input type="number" min={5} value={examMeta.duration} onChange={e => setExamMeta({ ...examMeta, duration: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Description (optional)</label>
                            <textarea rows={2} value={examMeta.description} onChange={e => setExamMeta({ ...examMeta, description: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none resize-none text-sm"
                                placeholder="Brief intro shown to students before they start." />
                        </div>

                        {/* Marking Scheme */}
                        <div className="pt-2 border-t border-slate-100 mt-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Marking Scheme</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Marks for Correct <span className="text-rose-500">*</span></label>
                                    <input type="number" min={1} value={examMeta.marksPerQuestion} onChange={e => setExamMeta({ ...examMeta, marksPerQuestion: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Negative Mark (per wrong) <span className="text-rose-500">*</span></label>
                                    <input type="number" step="0.01" min={0} value={examMeta.negativeMarks} onChange={e => setExamMeta({ ...examMeta, negativeMarks: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button type="button" onClick={() => setExamMeta({ ...examMeta, marksPerQuestion: 1, negativeMarks: 0 })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${examMeta.marksPerQuestion === 1 && examMeta.negativeMarks === 0 ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    Standard (+1/0)
                                </button>
                                <button type="button" onClick={() => setExamMeta({ ...examMeta, marksPerQuestion: 4, negativeMarks: 1 })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${examMeta.marksPerQuestion === 4 && examMeta.negativeMarks === 1 ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    NEET Style (+4/-1)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                        {questions.map((q, qIdx) => (
                            <div key={qIdx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                {/* Question Header */}
                                <div
                                    className="flex items-center gap-3 p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                    onClick={() => setExpandedQ(expandedQ === qIdx ? -1 : qIdx)}
                                >
                                    <span className="w-8 h-8 rounded-full bg-cyan-600 text-white text-sm font-black flex items-center justify-center shrink-0">{qIdx + 1}</span>
                                    <p className="flex-1 text-sm font-semibold text-slate-700 truncate">
                                        {q.questionText || <span className="text-slate-400 font-normal italic">Question text not yet entered</span>}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {questions.length > 1 && (
                                            <button type="button" onClick={(e) => { e.stopPropagation(); removeQuestion(qIdx); }}
                                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {expandedQ === qIdx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </div>

                                {/* Question Body */}
                                {expandedQ === qIdx && (
                                    <div className="px-5 pb-6 space-y-4 border-t border-slate-100 pt-5">
                                        {/* Question Text */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Question Text <span className="text-rose-500">*</span></label>
                                            <textarea rows={2} value={q.questionText} onChange={e => updateQuestion(qIdx, 'questionText', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none resize-none text-sm"
                                                placeholder="Enter your question here..." />
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                <ImageIcon className="w-3.5 h-3.5" /> Image Attachment (optional)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    id={`img-upload-${qIdx}`}
                                                    className="hidden"
                                                    onChange={e => uploadQuestionImage(qIdx, e.target.files[0])}
                                                />
                                                <label
                                                    htmlFor={`img-upload-${qIdx}`}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploadingImg[qIdx]
                                                        ? 'border-cyan-300 bg-cyan-50 cursor-wait'
                                                        : 'border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-cyan-50'
                                                        }`}
                                                >
                                                    {uploadingImg[qIdx] ? (
                                                        <><Loader2 className="w-4 h-4 text-cyan-500 animate-spin" /><span className="text-sm text-cyan-600 font-medium">Uploading...</span></>
                                                    ) : q.imageUrl ? (
                                                        <><ImageIcon className="w-4 h-4 text-emerald-500" /><span className="text-sm text-emerald-600 font-medium">Change image</span></>
                                                    ) : (
                                                        <><ImageIcon className="w-4 h-4 text-slate-400" /><span className="text-sm text-slate-500">Click to upload an image for this question</span></>
                                                    )}
                                                </label>
                                            </div>
                                            {q.imageUrl && !uploadingImg[qIdx] && (
                                                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-between">
                                                    <img src={q.imageUrl} alt="Preview" className="max-h-36 w-auto object-contain p-2" />
                                                    <button type="button" onClick={() => updateQuestion(qIdx, 'imageUrl', '')} className="p-2 mr-2 text-slate-400 hover:text-rose-500 transition-colors" title="Remove image">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Options */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Answer Options <span className="text-rose-500">*</span> — click the circle to mark correct answer</label>
                                            <div className="space-y-2">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors ${q.correctAnswer === oIdx ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                                                            className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all ${q.correctAnswer === oIdx ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-slate-400 hover:border-emerald-400'}`}
                                                            title="Mark as correct answer"
                                                        >
                                                            {String.fromCharCode(65 + oIdx)}
                                                        </button>
                                                        <input value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                                            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
                                                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} />
                                                        {q.correctAnswer === oIdx && (
                                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">Correct</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Explanation */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Explanation / Why this answer is correct (optional)</label>
                                            <textarea rows={2} value={q.explanation} onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-cyan-50 border border-cyan-100 rounded-xl focus:ring-2 focus:ring-cyan-400 outline-none resize-none text-sm text-cyan-900"
                                                placeholder="Explain why the selected option is the correct answer. This will be shown to students after they submit." />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add Question Button */}
                        <button type="button" onClick={addQuestion}
                            className="w-full py-3.5 border-2 border-dashed border-slate-200 text-slate-500 hover:border-cyan-300 hover:text-cyan-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                            <PlusCircle className="w-4 h-4" /> Add Question ({questions.length} added)
                        </button>
                    </div>

                    {/* Submit */}
                    <div className="mt-8 flex items-center justify-between gap-4 sticky bottom-0 bg-white p-4 border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] rounded-t-3xl">
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-200 transition-all border border-slate-200"
                        >
                            <Eye className="w-5 h-5" />
                            Preview
                        </button>
                        <button
                            type="submit"
                            disabled={isCreatingExam}
                            className="flex-1 py-4 bg-cyan-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all disabled:opacity-50 shadow-xl shadow-cyan-600/20"
                        >
                            {isCreatingExam ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            {isCreatingExam ? 'Publishing Exam...' : `Publish Exam (${questions.length} Qs)`}
                        </button>
                    </div>

                    {/* Preview Modal */}
                    {showPreview && (
                        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
                            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">{examMeta.title || 'Untitled Exam'}</h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-lg uppercase tracking-wider">{examMeta.subject || 'No Subject'}</span>
                                            <span className="text-xs font-bold text-slate-400">•</span>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{examMeta.duration} Mins</span>
                                            <span className="text-xs font-bold text-slate-400">•</span>
                                            <span className="text-xs font-bold text-emerald-600">+{examMeta.marksPerQuestion} / -{examMeta.negativeMarks} Scheme</span>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setShowPreview(false)} className="p-3 hover:bg-white rounded-full transition-all group">
                                        <X className="w-6 h-6 text-slate-400 group-hover:rotate-90 duration-300" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 space-y-12">
                                    {questions.map((q, idx) => (
                                        <div key={idx} className="space-y-6">
                                            <div className="flex gap-4">
                                                <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0 shadow-lg">{idx + 1}</span>
                                                <div className="flex-1 space-y-6">
                                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{q.questionText || <span className="text-rose-400 italic">No question text...</span>}</h3>
                                                    {q.imageUrl && (
                                                        <div className="rounded-3xl border border-slate-200 overflow-hidden bg-slate-50 max-w-lg">
                                                            <img src={q.imageUrl} alt="Preview" className="w-full h-auto object-contain max-h-[300px]" />
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {q.options.map((opt, oIdx) => (
                                                            <div key={oIdx} className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${oIdx === q.correctAnswer ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-slate-100 opacity-60'}`}>
                                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${oIdx === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                    {String.fromCharCode(65 + oIdx)}
                                                                </span>
                                                                <span className={`font-bold ${oIdx === q.correctAnswer ? 'text-emerald-900' : 'text-slate-500'}`}>{opt || <span className="italic">Empty option...</span>}</span>
                                                                {oIdx === q.correctAnswer && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {q.explanation && (
                                                        <div className="p-6 bg-amber-50 rounded-3xl border-l-4 border-amber-400">
                                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Correct Answer Explanation</p>
                                                            <p className="text-xs text-amber-900 italic font-medium">{q.explanation}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                                    <button type="button" onClick={() => setShowPreview(false)} className="px-12 py-3 bg-slate-900 text-white rounded-full font-black hover:scale-105 transition-all shadow-xl">
                                        Back to Editor
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            )}

            {/* ── STUDY MATERIALS TAB ── */}
            {activeTab === 'materials' && (
                <div className="space-y-6 max-w-2xl">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Upload className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Add Study Material</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Paste a link to a PDF, Google Drive file, YouTube video, or any resource.</p>
                            </div>
                        </div>
                        <form onSubmit={handleAddMaterial} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Material Title <span className="text-rose-500">*</span></label>
                                    <input required value={materialForm.title} onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                        placeholder="e.g. Chapter 1 – Cell Biology Notes" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                                    <select 
                                        value={materialForm.subject} 
                                        onChange={e => setMaterialForm({ ...materialForm, subject: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-700"
                                    >
                                        {(classroom?.subjects || []).map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Upload File (PDF or Image) <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="application/pdf,image/*"
                                        id="material-file-upload"
                                        className="hidden"
                                        onChange={e => handleMaterialFileChange(e.target.files[0])}
                                    />
                                    <label
                                        htmlFor="material-file-upload"
                                        className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploadingMaterialFile
                                            ? 'border-emerald-300 bg-emerald-50 cursor-wait'
                                            : materialForm.url
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50'
                                            }`}
                                    >
                                        {uploadingMaterialFile ? (
                                            <><Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /><span className="text-sm font-bold text-emerald-600">Uploading to cloud...</span></>
                                        ) : materialForm.url ? (
                                            <><CheckCircle2 className="w-5 h-5 text-emerald-600" /><div className="flex-1"><p className="text-sm font-bold text-emerald-700">File uploaded!</p><p className="text-[10px] text-emerald-500 truncate">{materialForm.url}</p></div><X onClick={(e) => { e.preventDefault(); setMaterialForm(prev => ({ ...prev, url: '' })); }} className="w-4 h-4 text-emerald-400 hover:text-rose-500" /></>
                                        ) : (
                                            <><Upload className="w-5 h-5 text-slate-400" /><div className="text-left"><p className="text-sm font-bold text-slate-600">Click to choose a file</p><p className="text-[10px] text-slate-400">PDF, JPG, PNG, WEBP supported</p></div></>
                                        )}
                                    </label>
                                </div>
                            </div>
                            <button type="submit" disabled={isUploadingMaterial || uploadingMaterialFile || !materialForm.url}
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 active:scale-95">
                                {isUploadingMaterial ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                {isUploadingMaterial ? 'Saving Material...' : 'Save Study Material'}
                            </button>
                        </form>
                    </div>

                    {/* Existing Materials */}
                    {classroom.lectureNotes && classroom.lectureNotes.length > 0 ? (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Uploaded Materials ({classroom.lectureNotes.length})</h3>
                            <ul className="divide-y divide-slate-100">
                                {classroom.lectureNotes.map((note, i) => (
                                    <li key={i} className="flex items-center justify-between py-3 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                                <BookOpen className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700 line-clamp-1">{note.title || 'Untitled'}</span>
                                                {note.subject && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{note.subject}</span>}
                                            </div>
                                        </div>
                                        <a href={note.url} target="_blank" rel="noreferrer"
                                            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline shrink-0">View →</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm font-medium">
                            No materials added yet. Add the first one above.
                        </div>
                    )}
                </div>
            )}

            {/* ── CLASS LINKS TAB ── */}
            {activeTab === 'links' && (
                <div className="space-y-6 max-w-2xl">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Eye className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Add Live Class Link</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Add meeting links for different subjects or teachers.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Link Title (e.g. Physics - Mr. X) <span className="text-rose-500">*</span></label>
                                    <input value={newLink.title} onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder="e.g. Biology Main Class" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                                    <select 
                                        value={newLink.subject} 
                                        onChange={e => setNewLink({ ...newLink, subject: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-700"
                                    >
                                        {(classroom?.subjects || []).map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Meeting URL <span className="text-rose-500">*</span></label>
                                <input value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="https://meet.google.com/..." />
                            </div>
                            <button onClick={handleAddLink} disabled={isUpdatingLinks || !newLink.title || !newLink.url}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95">
                                {isUpdatingLinks ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                                {isUpdatingLinks ? 'Adding Link...' : 'Add Class Link'}
                            </button>
                        </div>
                    </div>

                    {/* Existing Links */}
                    {classLinks.length > 0 ? (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Active Links ({classLinks.length})</h3>
                            <div className="space-y-3">
                                {classLinks.map((link, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                                <Eye className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{link.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {link.subject && <span className="text-[10px] font-black text-indigo-500 uppercase">{link.subject}</span>}
                                                    <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{link.url}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={link.url} target="_blank" rel="noreferrer" className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <button onClick={() => handleRemoveLink(i)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm font-medium">
                            No class links added yet. Add the first one above.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminClassroomDetails;
