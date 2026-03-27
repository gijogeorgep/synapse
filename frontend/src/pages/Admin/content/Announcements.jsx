import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, PlusCircle, Trash2, CheckCircle2, AlertCircle, Clock, X } from 'lucide-react';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        targetType: 'all',
        targetId: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/admin/announcements', config);
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/admin/announcements', formData, config);
            setStatus({ type: 'success', message: 'Announcement posted successfully!' });
            setIsModalOpen(false);
            setFormData({ title: '', content: '', targetType: 'all', targetId: '' });
            fetchAnnouncements();
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to post announcement.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/admin/announcements/${id}`, config);
            fetchAnnouncements();
        } catch (error) {
            console.error("Error deleting announcement:", error);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Announcements</h1>
                    <p className="text-slate-500 mt-2">Broadcast messages to students and teachers.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-md shadow-cyan-100"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Post New</span>
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
                    <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
                </div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Megaphone className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">No Announcements Yet</h3>
                    <p className="text-slate-400 mt-1">Start by clicking the "Post New" button.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {announcements.map((ann) => (
                        <div key={ann._id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
                             <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-center space-x-3">
                                     <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                                         <Megaphone className="w-5 h-5" />
                                     </div>
                                     <div>
                                         <h3 className="text-xl font-bold text-slate-800">{ann.title}</h3>
                                         <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mt-1">
                                             <Clock className="w-3.5 h-3.5" />
                                             <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                             <span>•</span>
                                             <span className="uppercase tracking-wider">Target: {ann.targetType}</span>
                                         </div>
                                     </div>
                                 </div>
                                 <button onClick={() => handleDelete(ann._id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                     <Trash2 className="w-5 h-5" />
                                 </button>
                             </div>
                             <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Post Announcement</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Title</label>
                                <input name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" required placeholder="Important Update..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Target Audience</label>
                                <select name="targetType" value={formData.targetType} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none">
                                    <option value="all">Everyone</option>
                                    <option value="role">By Role (Teacher/Student)</option>
                                    <option value="classroom">Specific Classroom</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Content</label>
                                <textarea name="content" value={formData.content} onChange={handleChange} rows="5" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none resize-none" required placeholder="Write your message here..."></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100">Broadcast Now</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;
