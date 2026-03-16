import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Lock, Camera, Save, Loader2 } from "lucide-react";
import { updateProfile, updatePassword, uploadImage } from "../../api/services";

const StudentSettings = () => {
    const { user, updateUser } = useAuth();

    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setAvatarPreview(url);

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            const result = await uploadImage(formData);

            await updateProfile({ avatarUrl: result.url });

            updateUser({ avatarUrl: result.url });

            alert("Profile picture updated successfully!");
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image: " + error);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const result = await updateProfile(profile);
            updateUser(result);
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Failed to update profile: " + error);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        setUpdatingPassword(true);
        try {
            await updatePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            alert("Password updated successfully!");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            alert("Failed to update password: " + error);
        } finally {
            setUpdatingPassword(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto p-4 md:p-8">
            <header>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Account Settings
                </h1>
                <p className="mt-2 text-slate-500">
                    Update your personal information, profile picture, and password.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-8">
                {/* Profile & avatar */}
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Personal Information
                            </h2>
                            <p className="text-sm text-slate-500">
                                This information is shown to your teachers inside the portal.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start border-t border-slate-50 pt-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-lg border-4 border-white">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    (user?.name || "S")[0].toUpperCase()
                                )}

                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-md cursor-pointer hover:bg-slate-50 transition-all hover:scale-110 active:scale-95 group-hover:border-cyan-200">
                                <Camera className="w-5 h-5 text-cyan-600" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        <form onSubmit={handleSaveProfile} className="flex-1 space-y-5 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleProfileChange}
                                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white text-sm font-medium transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={profile.phoneNumber}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white text-sm font-medium transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleProfileChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white text-sm font-medium transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-600 text-white text-sm font-bold shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span>Save Profile</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Password */}
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Security Settings
                        </h2>
                        <p className="text-sm text-slate-500">
                            Choose a strong password to keep your account safe.
                        </p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-5 border-t border-slate-50 pt-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    name="currentPassword"
                                    required
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                required
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white text-sm font-medium transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white text-sm font-medium transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updatingPassword}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updatingPassword ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Lock className="w-4 h-4" />
                            )}
                            <span>Change Password</span>
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default StudentSettings;
