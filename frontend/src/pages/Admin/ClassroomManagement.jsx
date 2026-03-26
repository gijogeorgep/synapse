import {
    getAdminClassrooms,
    getAdminUsers,
    createAdminClassroom,
    updateAdminClassroom,
    deleteAdminClassroom,
    assignUserToClassroom
} from '../../api/services';
import { X, GraduationCap, Users, PlusCircle, CheckCircle2, AlertCircle, BookOpen, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
const ClassroomManagement = () => {
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([])
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        className: '10',
        board: 'CBSE',
        subjects: '',
        type: 'Other',
        price: 0,
        isPublished: false,
        showOnHome: false,
        description: '',
        imageUrl: ''
    });

    const [editFormData, setEditFormData] = useState({
        name: '',
        className: '10',
        board: 'CBSE',
        subjects: '',
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
        userId: '',
        role: 'student'
    });

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
            setStatus({ type: 'error', message: 'Failed to load data.' });
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

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const payload = {
                ...formData,
                subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s)
            };

            await createAdminClassroom(payload);
            setStatus({ type: 'success', message: 'Classroom created successfully!' });

            setFormData({ name: '', className: '10', board: 'CBSE', subjects: '', type: 'Other', price: 0, isPublished: false, showOnHome: false, description: '', imageUrl: '' });
            fetchData();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: error || 'Error creating classroom' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (e, classroom) => {
        e.stopPropagation();
        setSelectedClassroom(classroom);
        setEditFormData({
            name: classroom.name,
            className: classroom.className,
            board: classroom.board,
            type: classroom.type || 'Other',
            price: classroom.price || 0,
            isPublished: classroom.isPublished || false,
            showOnHome: classroom.showOnHome || false,
            description: classroom.description || '',
            imageUrl: classroom.imageUrl || '',
            subjects: classroom.subjects?.join(', ') || ''
        });
        setIsEditModalOpen(true);
        setActiveMenu(null);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...editFormData,
                subjects: editFormData.subjects.split(',').map(s => s.trim()).filter(s => s)
            };
            await updateAdminClassroom(selectedClassroom._id, payload);
            setStatus({ type: 'success', message: 'Classroom updated successfully!' });
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            setStatus({ type: 'error', message: error || 'Error updating classroom' });
        } finally {
            setIsSubmitting(false);
        }
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
            setStatus({ type: 'success', message: 'Classroom deleted successfully!' });
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            setStatus({ type: 'error', message: error || 'Error deleting classroom' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();

        if (!assignData.classroomId || !assignData.userId) {
            setStatus({ type: 'error', message: 'Please select a classroom and a user.' });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await assignUserToClassroom(assignData.classroomId, {
                userIds: [assignData.userId],
                role: assignData.role
            });

            setStatus({ type: 'success', message: 'User assigned to classroom successfully!' });
            fetchData(); // Refresh classrooms with new data
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: error || 'Error assigning user' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter users dynamically based on role selected in assign form
    const availableUsersToAssign = users.filter(u => u.role === assignData.role);

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
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select name="type" value={editFormData.type} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700">
                                    <option value="Other">Standard (Class-wise)</option>
                                    <option value="NEET">NEET</option>
                                    <option value="JEE">JEE</option>
                                    <option value="PSC">PSC</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Classroom Name</label>
                                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" required />
                            </div>
                            {editFormData.type === 'Other' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Standard / Class</label>
                                            <select name="className" value={editFormData.className} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => <option key={c} value={c.toString()}>Class {c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Board</label>
                                            <select name="board" value={editFormData.board} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700">
                                                <option value="State">State</option>
                                                <option value="CBSE">CBSE</option>
                                                <option value="ICSE">ICSE</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Subjects (comma-separated)</label>
                                        <input type="text" name="subjects" value={editFormData.subjects} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                    <input type="number" name="price" value={editFormData.price} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" min="0" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-cyan-200 transition-colors">
                                    <input type="checkbox" name="isPublished" checked={editFormData.isPublished} onChange={(e) => setEditFormData({ ...editFormData, isPublished: e.target.checked })} className="w-5 h-5 accent-cyan-600 rounded cursor-pointer" />
                                    <span className="text-sm font-medium text-slate-700">Publish</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-cyan-200 transition-colors">
                                    <input type="checkbox" name="showOnHome" checked={editFormData.showOnHome} onChange={(e) => setEditFormData({ ...editFormData, showOnHome: e.target.checked })} className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
                                    <span className="text-sm font-medium text-slate-700">Show on Home</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Program Description (for Home Page)</label>
                                <textarea name="description" value={editFormData.description} onChange={handleEditChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" rows="2" placeholder="Briefly describe the program for the home page card..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Program Image URL</label>
                                <input type="text" name="imageUrl" value={editFormData.imageUrl} onChange={handleEditChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" placeholder="URL for the program card image..." />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors">Save Changes</button>
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

            <div>
                <h1 className="text-3xl font-bold text-slate-800">Classroom Management</h1>
                <p className="text-slate-500 mt-2">Create classrooms and assign students/teachers to them.</p>
            </div>

            {status.message && (
                <div className={`p-4 rounded-xl flex items-start space-x-3 animate-in fade-in duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                    <p className="font-medium">{status.message}</p>
                    <button onClick={() => setStatus({ type: '', message: '' })} className="ml-auto hover:bg-black/5 p-1 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Classroom Form */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                            <PlusCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">New Classroom</h2>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select name="type" value={formData.type} onChange={handleCreateChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700">
                                <option value="Other">Standard (Class-wise)</option>
                                <option value="NEET">NEET</option>
                                <option value="JEE">JEE</option>
                                <option value="PSC">PSC</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Classroom Name (e.g. Section A)</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleCreateChange}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                placeholder="E.g., Section A"
                            />
                        </div>

                        {formData.type === 'Other' ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Standard / Class</label>
                                        <select
                                            name="className"
                                            value={formData.className}
                                            onChange={handleCreateChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                                                <option key={c} value={c.toString()}>Class {c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Board</label>
                                        <select
                                            name="board"
                                            value={formData.board}
                                            onChange={handleCreateChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700"
                                        >
                                            <option value="State">State</option>
                                            <option value="CBSE">CBSE</option>
                                            <option value="ICSE">ICSE</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Subjects (comma-separated)</label>
                                    <input
                                        type="text"
                                        name="subjects"
                                        value={formData.subjects}
                                        onChange={handleCreateChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-700 placeholder-slate-400"
                                        placeholder="Math, Science, English"
                                    />
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleCreateChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" min="0" />
                            </div>
                        )}



                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-cyan-200 transition-colors">
                                <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="w-5 h-5 accent-cyan-600 rounded cursor-pointer" />
                                <span className="text-sm font-medium text-slate-700">Publish</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-cyan-200 transition-colors">
                                <input type="checkbox" name="showOnHome" checked={formData.showOnHome} onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })} className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
                                <span className="text-sm font-medium text-slate-700">Show on Home</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Program Description (for Home Page)</label>
                            <textarea name="description" value={formData.description} onChange={handleCreateChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" rows="2" placeholder="Briefly describe the program for the home page card..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Program Image URL</label>
                            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleCreateChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" placeholder="URL for the program card image..." />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center py-3 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 transition-all font-semibold"
                        >
                            Create Classroom
                        </button>
                    </form>
                </div>

                {/* Assign Users Form */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Assign Users</h2>
                    </div>

                    <form onSubmit={handleAssignSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Classroom</label>
                            <select
                                name="classroomId"
                                value={assignData.classroomId}
                                onChange={handleAssignChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                            >
                                {classrooms.length === 0 && <option value="">No classrooms available</option>}
                                {classrooms.map(c => (
                                    <option key={c._id} value={c._id}>{c.className} {c.board} - {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role to Assign</label>
                                <select
                                    name="role"
                                    value={assignData.role}
                                    onChange={handleAssignChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select {assignData.role === 'student' ? 'Student' : 'Teacher'}</label>
                                <select
                                    name="userId"
                                    value={assignData.userId}
                                    onChange={handleAssignChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                >
                                    <option value="">-- Select --</option>
                                    {availableUsersToAssign.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || classrooms.length === 0}
                            className="w-full flex items-center justify-center py-3 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all font-semibold"
                        >
                            Assign User
                        </button>
                    </form>
                </div>
            </div>

            {/* List Active Classrooms */}
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
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-slate-800 ">{c.name}</h3>
                                                {c.type !== 'Other' && (
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-100 text-cyan-700 uppercase`}>
                                                        {c.type}
                                                    </span>
                                                )}
                                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${c.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                    {c.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-cyan-600">Class {c.className} • {c.board}</p>
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
                                        <div className="flex flex-wrap gap-1">
                                            {c.subjects?.slice(0, 3).map(sub => (
                                                <span key={sub} className="text-xs px-2 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-md">
                                                    {sub}
                                                </span>
                                            ))}
                                            {c.subjects?.length > 3 && (
                                                <span className="text-xs px-2 py-1 bg-slate-50 text-slate-500 rounded-md">+{c.subjects.length - 3}</span>
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
        </div>
    );
};

export default ClassroomManagement;
