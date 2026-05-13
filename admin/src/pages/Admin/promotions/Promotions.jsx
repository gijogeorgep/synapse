import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, GraduationCap, CheckCircle2, AlertCircle, ChevronRight, Users, Loader2 } from 'lucide-react';
import { getAdminClassrooms, promoteClassroom } from '../../../api/services';

const Promotions = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPromoting, setIsPromoting] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [nextClass, setNextClass] = useState('11');
    const [status, setStatus] = useState({ type: '', message: '' });

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            setLoading(true);
            const data = await getAdminClassrooms();
            setClassrooms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching classrooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async () => {
        if (!selectedClassroom) return;
        if (!window.confirm(`Are you sure you want to promote ALL students in ${selectedClassroom.name} to Class ${nextClass}?`)) return;

        try {
            setIsPromoting(true);
            await promoteClassroom({
                classroomId: selectedClassroom._id,
                nextClass
            });
            
            setStatus({ type: 'success', message: `Successfully promoted classroom to Class ${nextClass}!` });
            fetchClassrooms();
            setSelectedClassroom(null);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to promote classroom.' });
        } finally {
            setIsPromoting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Bulk Promotions</h1>
                <p className="text-slate-500 mt-2">Efficiently move students to the next grade at the end of the term.</p>
            </div>

            {status.message && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium animate-in zoom-in-95 duration-200 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span>{status.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Classroom Selection */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-slate-400" /> Select Classroom
                    </h2>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classrooms.map(c => (
                                <button 
                                    key={c._id}
                                    onClick={() => {
                                        setSelectedClassroom(c);
                                        setNextClass((parseInt(c.className) + 1).toString());
                                    }}
                                    className={`p-5 rounded-2xl border text-left transition-all ${selectedClassroom?._id === c._id ? 'bg-cyan-600 border-cyan-600 text-white shadow-lg shadow-cyan-100' : 'bg-white border-slate-100 text-slate-700 hover:border-cyan-200'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{c.name}</h3>
                                            <p className={`text-sm font-medium ${selectedClassroom?._id === c._id ? 'text-cyan-100' : 'text-slate-400'}`}>
                                                Class {c.className} • {c.board}
                                            </p>
                                        </div>
                                        <div className={`p-2 rounded-xl ${selectedClassroom?._id === c._id ? 'bg-white/20' : 'bg-slate-50 text-slate-400'}`}>
                                            <Users className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className={`text-xs mt-4 font-bold ${selectedClassroom?._id === c._id ? 'text-cyan-50' : 'text-slate-400'}`}>
                                        {c.students?.length || 0} Students Assigned
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Promotion Action */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-fit space-y-6">
                    <h2 className="text-xl font-bold text-slate-800">Promotion Steps</h2>
                    
                    {!selectedClassroom ? (
                        <div className="text-center py-10 space-y-3">
                            <ArrowUpCircle className="w-12 h-12 text-slate-200 mx-auto" />
                            <p className="text-slate-400 font-medium">Please select a classroom to begin promotion.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center gap-4 text-slate-600">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Current</p>
                                    <p className="text-xl font-black">Lvl {selectedClassroom.className}</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-300" />
                                <div className="p-3 bg-emerald-50 rounded-2xl">
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">Promote To</p>
                                    <p className="text-xl font-black text-emerald-600">Lvl {nextClass}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Set Next Class Level</label>
                                    <select 
                                        value={nextClass} 
                                        onChange={(e) => setNextClass(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(l => (
                                            <option key={l} value={l.toString()}>Level {l}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                                    <h4 className="text-amber-800 font-bold text-sm flex items-center gap-2 mb-1">
                                        <AlertCircle className="w-4 h-4" /> Attention
                                    </h4>
                                    <p className="text-amber-700 text-xs leading-relaxed">
                                        This action will update the class level for all {selectedClassroom.students?.length} students and the classroom record. This cannot be undone easily.
                                    </p>
                                </div>

                                <button 
                                    onClick={handlePromote}
                                    disabled={isPromoting}
                                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                                >
                                    {isPromoting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpCircle className="w-5 h-5" />}
                                    <span>Execute Promotion</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Promotions;
