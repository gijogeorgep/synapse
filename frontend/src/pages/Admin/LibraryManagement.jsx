import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookCopy, PlusCircle, Search, Filter, FileText, Video, Link, Trash2, CheckCircle2, AlertCircle, X, ExternalLink, Eye, Download } from 'lucide-react';

const LibraryManagement = () => {
    const [resources, setResources] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [uploading, setUploading] = useState(false);
    const [uploadMethod, setUploadMethod] = useState('file');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        fileType: 'pdf',
        fileUrl: '',
        subject: '',
        board: 'CBSE',
        classroom: '',
        category: 'study_material',
        year: ''
    });

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const [resData, classData] = await Promise.all([
                axios.get('/api/admin/resources', config),
                axios.get('/api/admin/classrooms', config)
            ]);
            const resourcesData = Array.isArray(resData.data) ? resData.data : [];
            const classroomsData = Array.isArray(classData.data) ? classData.data : [];
            setResources(resourcesData);
            setClassrooms(classroomsData);
            if (classroomsData.length > 0) {
                setFormData(prev => ({ ...prev, classroom: classroomsData[0]._id, category: 'study_material', year: '' }));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/admin/resources', formData, config);
            setStatus({ type: 'success', message: 'Resource added to library!' });
            setIsModalOpen(false);
            setFormData({ title: '', description: '', fileType: 'pdf', fileUrl: '', subject: '', board: 'CBSE', classroom: classrooms[0]?._id || '', category: 'study_material', year: '' });
            setUploadMethod('file');
            fetchData();
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to add resource.' });
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const endpoint = isImage ? '/api/upload/image' : '/api/upload/file';
        const formDataPayload = new FormData();
        formDataPayload.append(isImage ? 'image' : 'file', file);

        setUploading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            const { data } = await axios.post(endpoint, formDataPayload, config);
            setFormData(prev => ({ ...prev, fileUrl: data.url, public_id: data.public_id }));
            setStatus({ type: 'success', message: 'File uploaded successfully' });
        } catch (error) {
            console.error('File upload failed:', error);
            setStatus({ type: 'error', message: 'File upload failed' });
        } finally {
            setUploading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'pdf': return <FileText className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            default: return <Link className="w-5 h-5" />;
        }
    };

    const selectedClassObj = classrooms.find(c => c._id === formData.classroom);
    const showBoard = !selectedClassObj || selectedClassObj.type === 'Other';

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Resource Library</h1>
                    <p className="text-slate-500 mt-2">Manage study materials, videos and reference links.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Resource</span>
                </button>
            </div>

            {status.message && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium animate-in zoom-in-95 duration-200 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span>{status.message}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
            ) : resources.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <BookCopy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">Library is Empty</h3>
                    <p className="text-slate-400 mt-1">Start by adding study materials or video links.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((res) => (
                        <div key={res._id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group overflow-hidden flex flex-col">
                             <div className="flex justify-between items-start mb-4">
                                 <div className={`p-3 rounded-2xl ${res.fileType === 'pdf' ? 'bg-orange-50 text-orange-600' : res.fileType === 'video' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                     {getTypeIcon(res.fileType)}
                                 </div>
                                 <div className="text-right">
                                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{res.subject}</span>
                                     <p className="text-[10px] font-black text-slate-300 uppercase mt-1 tracking-tighter">{res.category === 'question_paper' ? `Paper ${res.year ? `(${res.year})` : ''}` : 'Study Material'}</p>
                                     <p className="text-[10px] font-black text-slate-300 uppercase mt-1 tracking-tighter">{res.board}</p>
                                 </div>
                             </div>
                             <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">{res.title}</h3>
                             <p className="text-slate-500 text-sm mb-4 line-clamp-2">{res.description}</p>
                             
                                 <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                     <div className="flex items-center gap-2">
                                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 italic">
                                             {res.fileType.charAt(0).toUpperCase()}
                                         </div>
                                         <span className="text-xs font-bold text-slate-400">{res.classroom?.name || 'Global'}</span>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <button 
                                             onClick={async () => {
                                                 if(window.confirm('Are you sure you want to delete this resource?')) {
                                                     try {
                                                         const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                                                         await axios.delete(`/api/admin/resources/${res._id}`, config);
                                                         setStatus({ type: 'success', message: 'Resource deleted' });
                                                         fetchData();
                                                     } catch (error) {
                                                         setStatus({ type: 'error', message: 'Failed to delete resource' });
                                                     }
                                                 }
                                             }}
                                             className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                                             title="Delete Resource"
                                         >
                                             <Trash2 className="w-4 h-4" />
                                         </button>
                                         <div className="flex items-center space-x-2 border-l border-slate-100 pl-2">
                                             <a 
                                                 href={(res.fileType === 'pdf' || res.fileUrl?.toLowerCase().includes('.pdf')) ? `/api/materials/view/${res._id}/preview.pdf` : (res.fileUrl || "#")} 
                                                 target="_blank" 
                                                 rel="noreferrer" 
                                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-[10px] font-bold hover:bg-slate-50 transition-all shadow-sm"
                                                 title="Preview File"
                                             >
                                                 <Eye className="w-3.5 h-3.5" />
                                                 <span>VIEW</span>
                                             </a>
                                             <a 
                                                 href={(res.fileType === 'pdf' || res.fileUrl?.toLowerCase().includes('.pdf')) ? `/api/materials/view/${res._id}?download=true` : (res.fileUrl ? res.fileUrl.replace('/upload/', '/upload/fl_attachment/') : "#")} 
                                                 download 
                                                 rel="noreferrer"
                                                 className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all"
                                                 title="Download File"
                                             >
                                                 <Download className="w-3.5 h-3.5" />
                                             </a>
                                         </div>
                                     </div>
                                 </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Add to Library</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Classroom</label>
                                <select name="classroom" value={formData.classroom} onChange={(e)=>setFormData({...formData, classroom:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                                    <option value="">Global / All</option>
                                    {classrooms.map(c => <option key={c._id} value={c._id}>{c.name} {c.className !== 'N/A' ? `(${c.className})` : ''}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Title</label>
                                <input name="title" value={formData.title} onChange={(e)=>setFormData({...formData, title:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required placeholder="Resource Title" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Category</label>
                                    <select name="category" value={formData.category} onChange={(e)=>setFormData({...formData, category:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                                        <option value="study_material">Study Material</option>
                                        <option value="question_paper">Question Paper</option>
                                    </select>
                                </div>
                                {formData.category === 'question_paper' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Year</label>
                                        <input name="year" value={formData.year} onChange={(e)=>setFormData({...formData, year:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 2025" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Subject</label>
                                    <input name="subject" value={formData.subject} onChange={(e)=>setFormData({...formData, subject:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required placeholder="Computer Science" />
                                </div>
                                {showBoard && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Board</label>
                                        <select name="board" value={formData.board} onChange={(e)=>setFormData({...formData, board:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                                            <option value="CBSE">CBSE</option>
                                            <option value="State">State</option>
                                            <option value="ICSE">ICSE</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Resource Content</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                                    <button type="button" onClick={() => { setUploadMethod('file'); setFormData({...formData, fileType: 'pdf'}); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${uploadMethod === 'file' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>Upload File</button>
                                    <button type="button" onClick={() => { setUploadMethod('link'); setFormData({...formData, fileType: 'video'}); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${uploadMethod === 'link' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>Add Link</button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Format</label>
                                        {uploadMethod === 'file' ? (
                                            <select name="fileType" value={formData.fileType} onChange={(e)=>setFormData({...formData, fileType:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                                                <option value="pdf">PDF Document</option>
                                                <option value="jpeg">Image (JPEG/PNG)</option>
                                            </select>
                                        ) : (
                                            <select name="fileType" value={formData.fileType} onChange={(e)=>setFormData({...formData, fileType:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                                                <option value="video">Video Link</option>
                                                <option value="note">External Link / Note</option>
                                            </select>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{uploadMethod === 'file' ? 'Select File' : 'URL Link'}</label>
                                        {uploadMethod === 'file' ? (
                                            <div className="flex gap-2 items-center">
                                                <input type="file" onChange={handleFileUpload} accept={formData.fileType === 'pdf' ? '.pdf' : 'image/*'} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                                                {uploading && <span className="text-sm text-cyan-600 font-bold">Uploading...</span>}
                                                {formData.fileUrl && !uploading && <span className="text-sm text-emerald-600 font-bold truncate max-w-[150px]">Ready</span>}
                                            </div>
                                        ) : (
                                            <input name="fileUrl" value={formData.fileUrl} onChange={(e)=>setFormData({...formData, fileUrl:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required placeholder="https://..." />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Description</label>
                                <textarea name="description" value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})} rows="3" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="Brief summary of the material..."></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Add to Library</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryManagement;
