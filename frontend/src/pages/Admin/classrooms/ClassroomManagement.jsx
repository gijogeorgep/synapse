import {
    getAdminClassrooms,
    getAdminUsers,
    createAdminClassroom,
    updateAdminClassroom,
    deleteAdminClassroom,
    assignUserToClassroom
} from '../../../api/services';
import { X, GraduationCap, Users, PlusCircle, CheckCircle2, AlertCircle, BookOpen, MoreVertical, Edit, Trash2, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
const ClassroomManagement = () => {
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([])
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    const SUBJECT_TAGS = {
        State: ['Social Science', 'Chemistry', 'Physics', 'Mathematics', 'Biology', 'English', 'Malayalam', 'Hindi'],
        CBSE: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
        'E-Zone': ['NEET', 'PSC', 'JEE']
    };

    const [formData, setFormData] = useState({
        name: '',
        programType: 'PrimeOne',
        className: '10',
        board: 'CBSE',
        subjects: [],
        type: 'Other',
        price: 0,
        isPublished: false,
        showOnHome: false,
        description: '',
        imageUrl: ''
    });

    // When programType changes, reset className to appropriate default
    const handleProgramTypeChange = (type, isEdit) => {
        const setter = isEdit ? setEditFormData : setFormData;
        const currentData = isEdit ? editFormData : formData;
        setter({
            ...currentData,
            programType: type,
            subjects: [],
            className: type === 'E-Zone' ? 'NEET' : '10',
            board: type === 'E-Zone' ? 'Entrance/Exam' : 'CBSE'
        });
    };

    const [editFormData, setEditFormData] = useState({
        name: '',
        programType: 'PrimeOne',
        className: '10',
        board: 'CBSE',
        subjects: [],
        type: 'Other',
        price: 0,
        isPublished: false,
        showOnHome: false,
        description: '',
        imageUrl: ''
    });

    // Form for assigning users
    const [assignData, setAssignData] = useState({
        classroomId: '',
        userIds: [],
        role: 'student'
    });
    const [assignClassroomPickerOpen, setAssignClassroomPickerOpen] = useState(false);
    const [assignClassroomSearch, setAssignClassroomSearch] = useState('');
    const [assignUserPickerOpen, setAssignUserPickerOpen] = useState(false);
    const [assignUserSearch, setAssignUserSearch] = useState('');

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    useEffect(() => {
        fetchData();
        // Close menu on click outside
        const handleClickOutside = () => setActiveMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classData, usersData] = await Promise.all([
                getAdminClassrooms(),
                getAdminUsers()
            ]);

            setClassrooms(Array.isArray(classData) ? classData : []);
            setUsers(Array.isArray(usersData) ? usersData : []);

            if (Array.isArray(classData) && classData.length > 0) {
                setAssignData(prev => ({ ...prev, classroomId: classData[0]._id }));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleAssignChange = (e) => {
        setAssignData({ ...assignData, [e.target.name]: e.target.value });
    };

    const toggleAssignUser = (userId) => {
        setAssignData((prev) => ({
            ...prev,
            userIds: prev.userIds.includes(userId)
                ? prev.userIds.filter((id) => id !== userId)
                : [...prev.userIds, userId]
        }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await createAdminClassroom(formData);
            toast.success('Classroom created successfully!');
            setIsCreateModalOpen(false);

            setFormData({
                name: '',
                programType: 'PrimeOne',
                className: '10',
                board: 'CBSE',
                subjects: [],
                type: 'Other',
                price: 0,
                isPublished: false,
                showOnHome: false,
                description: '',
                imageUrl: ''
            });
            fetchData();
        } catch (error) {
            toast.error(error || 'Error creating classroom');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (e, classroom) => {
        e.stopPropagation();
        setSelectedClassroom(classroom);
        setEditFormData({
            name: classroom.name,
            programType: classroom.programType || 'PrimeOne',
            className: classroom.className,
            board: classroom.board,
            type: classroom.type || 'Other',
            price: classroom.price || 0,
            isPublished: classroom.isPublished || false,
            showOnHome: classroom.showOnHome || false,
            description: classroom.description || '',
            imageUrl: classroom.imageUrl || '',
            subjects: Array.isArray(classroom.subjects) ? classroom.subjects : []
        });
        setIsEditModalOpen(true);
        setActiveMenu(null);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateAdminClassroom(selectedClassroom._id, editFormData);
            toast.success('Classroom updated successfully!');
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error || 'Error updating classroom');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSubject = (isEdit, subject) => {
        const currentData = isEdit ? editFormData : formData;
        const setter = isEdit ? setEditFormData : setFormData;
        
        const newSubjects = currentData.subjects.includes(subject)
            ? currentData.subjects.filter(s => s !== subject)
            : [...currentData.subjects, subject];
            
        setter({ ...currentData, subjects: newSubjects });
    };

    const handleDeleteClick = (e, classroom) => {
        e.stopPropagation();
        setSelectedClassroom(classroom);
        setIsDeleteModalOpen(true);
        setActiveMenu(null);
    };

    const confirmDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteAdminClassroom(selectedClassroom._id);
            toast.success('Classroom deleted successfully!');
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error || 'Error deleting classroom');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();

        if (!assignData.classroomId || assignData.userIds.length === 0) {
            setStatus({ type: 'error', message: 'Please select a classroom and at least one user.' });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await assignUserToClassroom(assignData.classroomId, {
                userIds: assignData.userIds,
                role: assignData.role
            });

            toast.success(`${assignData.userIds.length} ${assignData.role}${assignData.userIds.length > 1 ? 's' : ''} assigned successfully!`);
            setAssignData(prev => ({ ...prev, userIds: [] }));
            setAssignUserPickerOpen(false);
            setAssignUserSearch('');
            fetchData(); // Refresh classrooms with new data
        } catch (error) {
            toast.error(error || 'Error assigning user');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter users dynamically based on role selected in assign form
    const availableUsersToAssign = users.filter(u => u.role === assignData.role);
    const selectedAssignClassroom = classrooms.find(c => c._id === assignData.classroomId);
    const filteredAssignableClassrooms = classrooms.filter((classroom) => {
        const query = assignClassroomSearch.trim().toLowerCase();
        if (!query) return true;
        return (
            classroom.name?.toLowerCase().includes(query) ||
            classroom.programType?.toLowerCase().includes(query) ||
            classroom.className?.toLowerCase().includes(query) ||
            classroom.board?.toLowerCase().includes(query)
        );
    });
    const filteredAssignableUsers = availableUsersToAssign.filter((user) => {
        const query = assignUserSearch.trim().toLowerCase();
        if (!query) return true;
        return (
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.uniqueId?.toLowerCase().includes(query)
        );
    });
    const selectedAssignUsers = availableUsersToAssign.filter(u => assignData.userIds.includes(u._id));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-4 md:p-8">
            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Edit Classroom</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateSubmit} className="space-y-6">
                            {/* Program Type Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">Program Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['PrimeOne', 'Cluster', 'PlanB', 'Deep Roots', 'E-Zone'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setEditFormData({ ...editFormData, programType: type, subjects: [] })}
                                            className={`py-2 px-3 rounded-lg border-2 transition-all font-bold text-xs ${
                                                editFormData.programType === type
                                                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                                                    : 'border-slate-100 bg-slate-50 text-slate-400'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Classroom Name</label>
                                    <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none font-medium" required />
                                </div>

                                {editFormData.programType === 'E-Zone' ? (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-wider">Exam / Subject Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['NEET', 'JEE', 'PSC'].map(exam => (
                                                <button
                                                    key={exam}
                                                    type="button"
                                                    onClick={() => setEditFormData({ ...editFormData, className: exam })}
                                                    className={`py-2 rounded-lg border-2 font-bold text-xs transition-all ${
                                                        editFormData.className === exam
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                    }`}
                                                >
                                                    {exam}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Standard / Class</label>
                                            <select name="className" value={editFormData.className} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => <option key={c} value={c.toString()}>Class {c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Board</label>
                                            <select name="board" value={editFormData.board} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700">
                                                <option value="State">State</option>
                                                <option value="CBSE">CBSE</option>
                                                <option value="ICSE">ICSE</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Subject Pills */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-wider">Subjects / Tags</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {(SUBJECT_TAGS[editFormData.programType === 'E-Zone' ? 'E-Zone' : editFormData.board] || []).map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleSubject(true, tag)}
                                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                                                editFormData.subjects.includes(tag)
                                                    ? 'bg-cyan-600 border-cyan-600 text-white'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-cyan-300'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Price (₹)</label>
                                    <input type="number" name="price" value={editFormData.price} onChange={handleEditChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" min="0" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <label className="flex items-center space-x-2 cursor-pointer p-2 bg-slate-50 rounded-lg border border-slate-200 w-full">
                                        <input type="checkbox" name="isPublished" checked={editFormData.isPublished} onChange={(e) => setEditFormData({ ...editFormData, isPublished: e.target.checked })} className="w-4 h-4 accent-cyan-600 rounded" />
                                        <span className="text-[10px] font-bold text-slate-600 uppercase">Published</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Description</label>
                                <textarea name="description" value={editFormData.description} onChange={handleEditChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-xs" rows="2" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Image URL</label>
                                <input type="text" name="imageUrl" value={editFormData.imageUrl} onChange={handleEditChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-[10px]" />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-cyan-700 transition-colors">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Delete Classroom</h2>
                        <p className="text-slate-500 mt-2">Are you sure you want to delete <span className="font-bold text-slate-700">{selectedClassroom.name}</span>? All assignments will be removed.</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={confirmDelete} disabled={isSubmitting} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors">Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                                    <PlusCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Create Classroom</h2>
                            </div>
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Select Program Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['PrimeOne', 'Cluster', 'PlanB', 'Deep Roots', 'E-Zone'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleProgramTypeChange(type, false)}
                                            className={`py-3 px-4 rounded-xl border-2 transition-all font-bold text-sm ${
                                                formData.programType === type
                                                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm'
                                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-slate-50">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Classroom Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleCreateChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                        placeholder={formData.programType === 'E-Zone' ? 'E.g., Special Batch 2024' : 'E.g., Section A'}
                                    />
                                </div>

                                {formData.programType === 'E-Zone' ? (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Exam / Subject Type</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['NEET', 'JEE', 'PSC'].map(exam => (
                                                <button
                                                    key={exam}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, className: exam })}
                                                    className={`py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                                                        formData.className === exam
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                                    }`}
                                                >
                                                    {exam}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Standard / Class</label>
                                            <select
                                                name="className"
                                                value={formData.className}
                                                onChange={handleCreateChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700 font-medium"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                                                    <option key={c} value={c.toString()}>Class {c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Board</label>
                                            <select
                                                name="board"
                                                value={formData.board}
                                                onChange={handleCreateChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700 font-medium"
                                            >
                                                <option value="State">State</option>
                                                <option value="CBSE">CBSE</option>
                                                <option value="ICSE">ICSE</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 border-t border-slate-50">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">Select Subjects / Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {(SUBJECT_TAGS[formData.programType === 'E-Zone' ? 'E-Zone' : formData.board] || []).map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleSubject(false, tag)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                                formData.subjects.includes(tag)
                                                    ? 'bg-cyan-600 border-cyan-600 text-white shadow-md shadow-cyan-900/10'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-300 hover:text-cyan-600'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Price (₹)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleCreateChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" min="0" />
                                </div>
                                <div className="flex flex-col justify-end gap-2">
                                    <label className="flex items-center space-x-3 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-cyan-200 transition-colors">
                                        <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="w-4 h-4 accent-cyan-600 rounded cursor-pointer" />
                                        <span className="text-xs font-bold text-slate-700 uppercase">Publish</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Program Description</label>
                                <textarea name="description" value={formData.description} onChange={handleCreateChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" rows="2" placeholder="Brief program overview..." />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Cover Photo URL</label>
                                <div className="flex gap-3">
                                    <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleCreateChange} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-xs" placeholder="https://image-url.com/photo.jpg" />
                                    {formData.imageUrl && (
                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-900/10 text-sm font-black text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 transition-all uppercase tracking-widest"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Classroom'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Classroom Management</h1>
                    <p className="text-slate-500 mt-2">Create classrooms and assign students/teachers to them.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-900/10 transition-all hover:bg-cyan-700"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Create Classroom</span>
                </button>
            </div>


            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">All Classrooms</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
                    </div>
                ) : classrooms.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-slate-500 font-medium">No Classrooms Available</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classrooms.map((c) => (
                            <div key={c._id} className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-50 to-transparent -mr-12 -mt-12 rounded-full z-0 group-hover:scale-110 transition-transform"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-bold text-lg text-slate-800 ">{c.name}</h3>
                                                <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase">
                                                    {c.programType || 'PrimeOne'}
                                                </span>
                                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg uppercase ${c.isPublished ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                    {c.isPublished ? 'Live' : 'Draft'}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
                                                {c.programType === 'E-Zone'
                                                    ? `${c.className || 'E-Zone'} • Entrance/Exam`
                                                    : `Class ${c.className} • ${c.board}`}
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === c._id ? null : c._id); }}
                                                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5 text-slate-400" />
                                            </button>

                                            {activeMenu === c._id && (
                                                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                                                    <button onClick={(e) => handleEditClick(e, c)} className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 text-left transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <div className="h-px bg-slate-50 my-1"></div>
                                                    <button onClick={(e) => handleDeleteClick(e, c)} className="flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left transition-colors font-medium">
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {c.subjects?.slice(0, 4).map(sub => (
                                                <span key={sub} className="text-[10px] font-bold px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-full">
                                                    {sub}
                                                </span>
                                            ))}
                                            {c.subjects?.length > 4 && (
                                                <span className="text-[10px] font-bold px-2 py-1 bg-cyan-50 text-cyan-600 rounded-full">+{c.subjects.length - 4}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0 z-10 relative">
                                                T: {c.teachers?.length || 0}
                                            </div>
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0 z-0">
                                                S: {c.students?.length || 0}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/admin/classrooms/${c._id}`)}
                                            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Assign Users Form */}
                <div className="bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-slate-100 h-fit max-w-5xl">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Assign Users</h2>
                                <p className="text-sm text-slate-500 mt-1">Choose a classroom, pick a role, and assign one or more users in a single step.</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <Users className="w-5 h-5" />
                            <span>{availableUsersToAssign.length} available</span>
                        </div>
                    </div>

                    <form onSubmit={handleAssignSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.9fr] gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Select Classroom</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setAssignClassroomPickerOpen((prev) => !prev)}
                                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-700 transition-all hover:border-indigo-300"
                                    >
                                        <div className="min-w-0 flex-1">
                                            {selectedAssignClassroom ? (
                                                <div className="space-y-0.5">
                                                    <p className="truncate text-sm font-bold text-slate-800">{selectedAssignClassroom.name}</p>
                                                    <p className="truncate text-xs text-slate-500">
                                                        {selectedAssignClassroom.programType === 'E-Zone'
                                                            ? `${selectedAssignClassroom.className} • Entrance/Exam`
                                                            : `Class ${selectedAssignClassroom.className} • ${selectedAssignClassroom.board}`}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-medium text-slate-400">Choose a classroom</span>
                                            )}
                                        </div>
                                        <ChevronDown className={`ml-3 h-5 w-5 shrink-0 text-slate-400 transition-transform ${assignClassroomPickerOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {assignClassroomPickerOpen && (
                                        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                                            <div className="border-b border-slate-100 p-3">
                                                <div className="relative">
                                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={assignClassroomSearch}
                                                        onChange={(e) => setAssignClassroomSearch(e.target.value)}
                                                        placeholder="Search classroom by name, program, class, or board"
                                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-72 overflow-y-auto p-2">
                                                {filteredAssignableClassrooms.length === 0 ? (
                                                    <div className="px-4 py-8 text-center text-sm text-slate-400">
                                                        No classrooms found.
                                                    </div>
                                                ) : (
                                                    filteredAssignableClassrooms.map((classroom) => {
                                                        const isSelected = assignData.classroomId === classroom._id;
                                                        return (
                                                            <button
                                                                key={classroom._id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setAssignData((prev) => ({ ...prev, classroomId: classroom._id }));
                                                                    setAssignClassroomPickerOpen(false);
                                                                    setAssignClassroomSearch('');
                                                                }}
                                                                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                                                                    isSelected
                                                                        ? 'bg-indigo-50 text-indigo-700'
                                                                        : 'text-slate-700 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                                                    isSelected
                                                                        ? 'border-indigo-500 bg-indigo-600 text-white'
                                                                        : 'border-slate-300 bg-white'
                                                                }`}>
                                                                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-bold">{classroom.name}</p>
                                                                    <p className="truncate text-xs text-slate-500">
                                                                        {classroom.programType === 'E-Zone'
                                                                            ? `${classroom.className} • Entrance/Exam`
                                                                            : `Class ${classroom.className} • ${classroom.board}`}
                                                                    </p>
                                                                </div>
                                                                <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200">
                                                                    {classroom.programType || 'Program'}
                                                                </span>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Role to Assign</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'student', label: 'Student' },
                                        { value: 'teacher', label: 'Teacher' }
                                    ].map((roleOption) => (
                                        <button
                                            key={roleOption.value}
                                            type="button"
                                            onClick={() => {
                                                setAssignData({ ...assignData, role: roleOption.value, userIds: [] });
                                                setAssignUserPickerOpen(false);
                                                setAssignUserSearch('');
                                            }}
                                            className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                                                assignData.role === roleOption.value
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            {roleOption.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2">Chosen Classroom</p>
                                {selectedAssignClassroom ? (
                                    <div className="space-y-1">
                                        <p className="text-base font-bold text-slate-800">{selectedAssignClassroom.name}</p>
                                        <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">
                                            {selectedAssignClassroom.programType === 'E-Zone'
                                                ? `${selectedAssignClassroom.className} • Entrance/Exam`
                                                : `Class ${selectedAssignClassroom.className} • ${selectedAssignClassroom.board}`}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">Pick a classroom to continue.</p>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2">Chosen {assignData.role === 'student' ? 'Students' : 'Teachers'}</p>
                                {selectedAssignUsers.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAssignUsers.map((user) => (
                                            <span key={user._id} className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-700">
                                                    {(user.name?.[0] || '?').toUpperCase()}
                                                </span>
                                                <span>{user.name}</span>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">Select one or more {assignData.role}s from the picker below.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Select {assignData.role === 'student' ? 'Students' : 'Teachers'}
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setAssignUserPickerOpen((prev) => !prev)}
                                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-700 transition-all hover:border-indigo-300"
                                >
                                    <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                                        {selectedAssignUsers.length > 0 ? (
                                            selectedAssignUsers.map((user) => (
                                                <span key={user._id} className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                                                    <span className="truncate max-w-[120px]">{user.name}</span>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm font-medium text-slate-400">
                                                Choose one or more {assignData.role}s
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown className={`ml-3 h-5 w-5 shrink-0 text-slate-400 transition-transform ${assignUserPickerOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {assignUserPickerOpen && (
                                    <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                                        <div className="border-b border-slate-100 p-3">
                                            <div className="relative">
                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={assignUserSearch}
                                                    onChange={(e) => setAssignUserSearch(e.target.value)}
                                                    placeholder={`Search ${assignData.role} by name, email, or ID`}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-72 overflow-y-auto p-2">
                                            {filteredAssignableUsers.length === 0 ? (
                                                <div className="px-4 py-8 text-center text-sm text-slate-400">
                                                    No {assignData.role}s found.
                                                </div>
                                            ) : (
                                                filteredAssignableUsers.map((user) => {
                                                    const isSelected = assignData.userIds.includes(user._id);
                                                    return (
                                                        <button
                                                            key={user._id}
                                                            type="button"
                                                            onClick={() => toggleAssignUser(user._id)}
                                                            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                                                                isSelected
                                                                    ? 'bg-indigo-50 text-indigo-700'
                                                                    : 'text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                                                isSelected
                                                                    ? 'border-indigo-500 bg-indigo-600 text-white'
                                                                    : 'border-slate-300 bg-white'
                                                            }`}>
                                                                {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                            </div>
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                                                {(user.name?.[0] || '?').toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-bold">{user.name}</p>
                                                                <p className="truncate text-xs text-slate-500">{user.email}</p>
                                                            </div>
                                                            {user.uniqueId && (
                                                                <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200">
                                                                    {user.uniqueId}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-400">Custom multi-select picker. You can choose multiple users at once.</p>
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                type="submit"
                                disabled={isSubmitting || classrooms.length === 0}
                                className="inline-flex min-w-[180px] items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? 'Assigning...'
                                    : selectedAssignUsers.length > 0
                                        ? `Assign ${selectedAssignUsers.length} ${assignData.role === 'student' ? 'Student' : 'Teacher'}${selectedAssignUsers.length === 1 ? '' : 's'}`
                                        : `Assign ${assignData.role === 'student' ? 'Students' : 'Teachers'}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClassroomManagement;
