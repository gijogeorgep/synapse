import React, { useState, useRef } from 'react';
import { User, Mail, Camera, Lock, Save, ArrowLeft, Loader2, Key } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { updateProfile, updatePassword, uploadImage } from '../../../api/services';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminProfile = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Profile Info State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatar, setAvatar] = useState(user?.avatarUrl || '');
    
    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Loading States
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size check (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        try {
            const res = await uploadImage(formData);
            if (res?.url) {
                setAvatar(res.url);
                toast.success('Photo uploaded! Save changes to apply.');
            }
        } catch (error) {
            toast.error('Failed to upload image');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name || !email) {
            toast.error('Name and Email are required');
            return;
        }

        setIsUpdatingProfile(true);
        try {
            const res = await updateProfile({ name, email, avatarUrl: avatar });
            if (res) {
                // Update local auth context if the service returns updated user
                // If updateProfile doesn't return full user, we might need a getProfile call or just merge
                login(res); // Assuming login updates the user object in context
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('All password fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await updatePassword({ currentPassword, newPassword });
            toast.success('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error(error.message || 'Failed to change password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Account Settings</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage your administrator profile and security preferences.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Avatar & Quick Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center space-y-6">
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-inner overflow-hidden bg-slate-100">
                                {avatar ? (
                                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-sky-600 text-white text-4xl font-bold">
                                        {name?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                )}
                                
                                {isUploading && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-full">
                                        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-1 right-1 p-2.5 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all group-hover:bg-cyan-600"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
                            <p className="text-cyan-600 font-bold text-xs uppercase tracking-widest mt-1">{user?.role}</p>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-slate-500 text-sm justify-center">
                                <Mail className="w-4 h-4" />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 text-[10px] justify-center uppercase font-bold tracking-tighter">
                                <span>Last updated: {new Date(user?.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Profile Information Form */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800">Personal Information</h3>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium text-slate-700"
                                        placeholder="Admin Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium text-slate-700"
                                        placeholder="admin@synapse.com"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    disabled={isUpdatingProfile}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800">Security & Password</h3>
                        </div>
                        <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-rose-500 transition-all font-medium text-slate-700 pr-12"
                                        placeholder="••••••••"
                                    />
                                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-rose-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium text-slate-700"
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium text-slate-700"
                                        placeholder="Re-type new password"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    disabled={isUpdatingPassword}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-rose-600 text-white rounded-2xl font-bold text-sm hover:bg-rose-700 hover:shadow-lg transition-all disabled:opacity-50 shadow-[0_4px_14px_0_rgba(225,29,72,0.39)]"
                                >
                                    {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
