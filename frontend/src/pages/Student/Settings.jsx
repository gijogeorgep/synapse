import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Lock, Camera, Save, Loader2, ShieldCheck, Phone } from "lucide-react";
import { getProfile, updateProfile, updatePassword, uploadImage } from "../../api/services";

const StudentSettings = () => {
    const { user, updateUser } = useAuth();

    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        uniqueId: user?.uniqueId || "",
    });

    // Fetch fresh profile data on mount to ensure phoneNumber and uniqueId are present
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const data = await getProfile();
                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                    phoneNumber: data.phoneNumber || "",
                    uniqueId: data.uniqueId || "",
                });
                // Also update the auth context if data has changed
                if (data.phoneNumber !== user?.phoneNumber || data.uniqueId !== user?.uniqueId) {
                    updateUser(data);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfileData();
    }, []);

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        if (name === "phoneNumber") {
            // Only allow numbers and max 10 digits
            const numericValue = value.replace(/\D/g, "").slice(0, 10);
            setProfile((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setProfile((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const calculateStrength = (password) => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-zA-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const getStrengthConfig = (strength) => {
        if (strength === 0) return { label: "", color: "bg-slate-200", width: "0%" };
        if (strength <= 1) return { label: "Weak", color: "bg-red-500", width: "25%" };
        if (strength === 2) return { label: "Fair", color: "bg-orange-500", width: "50%" };
        if (strength === 3) return { label: "Good", color: "bg-yellow-500", width: "75%" };
        return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    };

    const strength = calculateStrength(passwords.newPassword);
    const strengthConfig = getStrengthConfig(strength);

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

            toast.success("Profile picture updated successfully!");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image: " + error);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        
        // Phone Number Validation - 10 digits
        const phoneRegex = /^\d{10}$/;
        if (profile.phoneNumber && !phoneRegex.test(profile.phoneNumber.replace(/\s+/g, ""))) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        setSaving(true);
        try {
            // Updated to send both name and phoneNumber
            await updateProfile({ 
                name: profile.name,
                phoneNumber: profile.phoneNumber
            });
            updateUser({ ...user, name: profile.name, phoneNumber: profile.phoneNumber });
            toast.success("Profile updated successfully!");
            setIsEditingProfile(false);
        } catch (error) {
            toast.error("Failed to update profile: " + error);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New password and confirm password do not match.");
            return;
        }

        setUpdatingPassword(true);
        try {
            await updatePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success("Password updated successfully!");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setIsEditingPassword(false);
        } catch (error) {
            toast.error("Failed to update password: " + error);
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
                        {!isEditingProfile && (
                            <button
                                onClick={() => setIsEditingProfile(true)}
                                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                Edit Profile
                            </button>
                        )}
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
                                        SSEH Unique ID
                                    </label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <input
                                            type="text"
                                            readOnly
                                            value={profile.uniqueId || "Not Assigned"}
                                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 text-sm font-bold cursor-not-allowed"
                                        />
                                    </div>
                                </div>

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
                                            readOnly={!isEditingProfile}
                                            className={`w-full pl-11 pr-4 py-3 rounded-2xl border transition-all text-sm font-medium focus:outline-none ${
                                                isEditingProfile 
                                                    ? "border-cyan-200 bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500" 
                                                    : "border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed"
                                            }`}
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
                                            readOnly
                                            value={profile.email}
                                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 text-sm font-medium cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={profile.phoneNumber}
                                            onChange={handleProfileChange}
                                            readOnly={!isEditingProfile}
                                            maxLength={10}
                                            className={`w-full pl-11 pr-4 py-3 rounded-2xl border transition-all text-sm font-medium focus:outline-none ${
                                                isEditingProfile 
                                                    ? "border-cyan-200 bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500" 
                                                    : "border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed"
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditingProfile && (
                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingProfile(false)}
                                        className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
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
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </section>

                {/* Password */}
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                    <div>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Security Settings
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Choose a strong password to keep your account safe.
                                </p>
                            </div>
                            {!isEditingPassword && (
                                <button
                                    onClick={() => setIsEditingPassword(true)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    Change Password
                                </button>
                            )}
                        </div>
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
                                    readOnly={!isEditingPassword}
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordChange}
                                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border transition-all text-sm font-medium focus:outline-none ${
                                        isEditingPassword 
                                            ? "border-cyan-200 bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500" 
                                            : "border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed"
                                    }`}
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
                                readOnly={!isEditingPassword}
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                className={`w-full px-4 py-3 rounded-2xl border transition-all text-sm font-medium focus:outline-none ${
                                    isEditingPassword 
                                        ? "border-cyan-200 bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500" 
                                        : "border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed"
                                }`}
                            />
                            {isEditingPassword && passwords.newPassword && (
                                <div className="mt-2 px-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Password Strength
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase ${strengthConfig.color.replace('bg-', 'text-')}`}>
                                            {strengthConfig.label}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${strengthConfig.color} transition-all duration-500 ease-out`}
                                            style={{ width: strengthConfig.width }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                        Must be at least 8 characters with letters & numbers
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                readOnly={!isEditingPassword}
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                className={`w-full px-4 py-3 rounded-2xl border transition-all text-sm font-medium focus:outline-none ${
                                    isEditingPassword 
                                        ? "border-cyan-200 bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500" 
                                        : "border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed"
                                }`}
                            />
                        </div>

                        {isEditingPassword && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPassword(false)}
                                    className="flex-1 px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatingPassword}
                                    className="flex-[2] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updatingPassword ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                    <span>Change Password</span>
                                </button>
                            </div>
                        )}
                    </form>
                </section>
            </div>
        </div>
    );
};

export default StudentSettings;
