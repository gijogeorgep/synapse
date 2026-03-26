import { useState } from "react";
import { X, Mail, Lock, User, ShieldCheck, Loader2, Phone, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sendOtpAPI } from "../../api/authService";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState(initialMode); // 'login', 'register', 'verify'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        otp: "",
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let result;
        if (mode === "login") {
            result = await login(formData.email, formData.password);
        } else if (mode === "register") {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                setLoading(false);
                return;
            }
            try {
                await sendOtpAPI(formData.email);
                setMode("verify");
                setLoading(false);
                return;
            } catch (err) {
                setError(err.response?.data?.message || "Failed to send OTP. Email may already be in use.");
                setLoading(false);
                return;
            }
        } else if (mode === "verify") {
            result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                otp: formData.otp,
            });
        }

        if (result.success) {
            if (mode === "verify") {
                navigate("/student/select-classroom");
            }
            onClose();
        } else {
            setError(result.message || "Something went wrong");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl transition-all duration-300">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                            {mode === "login" ? "Welcome Back" : "Join Synapse"}
                        </h2>
                        <p className="text-slate-500 mt-2">
                            {mode === "login"
                                ? "Sign in to access your dashboard"
                                : "Create an account to start learning"}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {/* Mode Switcher */}
                    <div className="flex p-1 mb-8 bg-slate-100 rounded-xl">
                        <button
                            disabled={loading || mode === "verify"}
                            onClick={() => setMode("login")}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "login"
                                ? "bg-white text-cyan-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                } disabled:opacity-50`}
                        >
                            Login
                        </button>
                        <button
                            disabled={loading || mode === "verify"}
                            onClick={() => setMode("register")}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${(mode === "register" || mode === "verify")
                                ? "bg-white text-cyan-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                } disabled:opacity-50`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "verify" && (
                            <div className="text-center mb-6 animate-in fade-in zoom-in">
                                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                                <h3 className="text-lg font-bold text-slate-800">Verify Your Email</h3>
                                <p className="text-sm text-slate-500 mt-1">We've sent a 6-digit code to <span className="font-bold text-slate-700">{formData.email}</span></p>
                                
                                <div className="relative mt-6">
                                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="otp"
                                        placeholder="6-Digit OTP"
                                        required
                                        disabled={loading}
                                        value={formData.otp}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 tracking-widest text-center text-lg font-bold text-slate-700"
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                        )}

                        {mode !== "verify" && mode === "register" && (
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    required
                                    disabled={loading}
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50"
                                />
                            </div>
                        )}

                        {mode !== "verify" && (
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    required
                                    disabled={loading}
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50"
                                />
                            </div>
                        )}

                        {mode !== "verify" && mode === "register" && (
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    required
                                    disabled={loading}
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50"
                                />
                            </div>
                        )}

                        {mode !== "verify" && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    required
                                    disabled={loading}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50"
                                />
                            </div>
                        )}

                        {mode !== "verify" && mode === "register" && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    required
                                    disabled={loading}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 duration-200 mt-4 disabled:opacity-70 flex items-center justify-center space-x-2 ${
                                mode === "verify" ? "bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/30" : "bg-gradient-to-r from-cyan-600 to-indigo-600 hover:shadow-cyan-500/30 hover:scale-[1.02]"
                            }`}
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            <span>{mode === "login" ? "Sign In" : mode === "verify" ? "Verify & Register" : "Continue"}</span>
                        </button>
                    </form>

                    {mode === "login" && (
                        <p className="text-center text-sm text-slate-500 mt-6">
                            Don't have an account?{" "}
                            <button
                                disabled={loading}
                                onClick={() => setMode("register")}
                                className="text-cyan-600 font-semibold hover:underline disabled:opacity-50"
                            >
                                Sign up
                            </button>
                        </p>
                    )}

                    {mode === "register" && (
                        <p className="text-center text-sm text-slate-500 mt-6">
                            Already have an account?{" "}
                            <button
                                disabled={loading}
                                onClick={() => setMode("login")}
                                className="text-cyan-600 font-semibold hover:underline disabled:opacity-50"
                            >
                                Sign in
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
