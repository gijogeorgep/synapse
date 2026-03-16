import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, GraduationCap, Mail, AlertCircle } from 'lucide-react';

const AdminClassroomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    useEffect(() => {
        fetchClassroomDetails();
    }, [id]);

    const fetchClassroomDetails = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            // We fetch all classrooms and find the specific one. 
            // In a larger app, a specific GET /api/admin/classrooms/:id endpoint would be better.
            const { data } = await axios.get('/api/admin/classrooms', config);
            const selectedClassroom = data.find(c => c._id === id);

            if (selectedClassroom) {
                setClassroom(selectedClassroom);
            } else {
                setError('Classroom not found.');
            }
        } catch (err) {
            console.error("Error fetching classroom details:", err);
            setError('Failed to load classroom details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !classroom) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto mt-12 text-center">
                <AlertCircle className="w-16 h-16 text-rose-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{error || "Classroom details unavailable"}</h2>
                <p className="text-slate-500 mb-6">We couldn't find the requested classroom information.</p>
                <button
                    onClick={() => navigate('/admin/classrooms')}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex items-start space-x-4 mb-2">
                <button
                    onClick={() => navigate('/admin/classrooms')}
                    className="p-2.5 mt-1 bg-white text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 focus:bg-cyan-50 focus:text-cyan-600 rounded-xl shadow-sm border border-slate-200 hover:border-cyan-200 transition-all outline-none"
                    title="Back to Classrooms"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-slate-900">{classroom.name}</h1>
                                <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-bold rounded-full border border-cyan-200">
                                    Class {classroom.className}
                                </span>
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full border border-indigo-200">
                                    {classroom.board}
                                </span>
                            </div>
                            <p className="text-slate-500 font-medium">Detailed overview of assigned teachers and enrolled students.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 relative z-10 shadow-inner">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Subjects</p>
                        <h3 className="text-3xl font-black text-slate-800 leading-none">{classroom.subjects?.length || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 relative z-10 shadow-inner">
                        <Users className="w-7 h-7" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Teachers</p>
                        <h3 className="text-3xl font-black text-slate-800 leading-none">{classroom.teachers?.length || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 relative z-10 shadow-inner">
                        <GraduationCap className="w-7 h-7" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Enrolled Students</p>
                        <h3 className="text-3xl font-black text-slate-800 leading-none">{classroom.students?.length || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Subjects Overview */}
            {classroom.subjects && classroom.subjects.length > 0 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-slate-400" /> Subjects Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {classroom.subjects.map((sub, idx) => (
                            <span key={idx} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-sm">
                                {sub}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Teachers Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full ring-1 ring-slate-900/5">
                    <div className="p-6 border-b border-slate-100 bg-indigo-50/30 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl shadow-inner">
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Assigned Teachers</h2>
                        </div>
                    </div>

                    <div className="p-0 flex-1 overflow-y-auto max-h-[500px]">
                        {!classroom.teachers || classroom.teachers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                <Users className="w-12 h-12 text-slate-200 mb-3" />
                                <p className="text-slate-500 font-medium">No teachers assigned to this classroom yet.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {classroom.teachers.map((teacher, index) => (
                                    <li key={teacher._id || index} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                                            {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-bold text-slate-800 truncate">{teacher.name || 'Unknown Teacher'}</h4>
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{teacher.email || 'No email provided'}</span>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 shrink-0">
                                            Teacher
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Students Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full ring-1 ring-slate-900/5">
                    <div className="p-6 border-b border-slate-100 bg-blue-50/30 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shadow-inner">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Enrolled Students</h2>
                        </div>
                    </div>

                    <div className="p-0 flex-1 overflow-y-auto max-h-[500px]">
                        {!classroom.students || classroom.students.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                <GraduationCap className="w-12 h-12 text-slate-200 mb-3" />
                                <p className="text-slate-500 font-medium">No students enrolled in this classroom.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {classroom.students.map((student, index) => (
                                    <li key={student._id || index} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-bold text-slate-800 truncate">{student.name || 'Unknown Student'}</h4>
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{student.email || 'No email provided'}</span>
                                            </div>
                                        </div>
                                        {student.uniqueId && (
                                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded truncate max-w-[100px]">
                                                ID: {student.uniqueId}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminClassroomDetails;
