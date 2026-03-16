import { useState } from "react";
import { X, Mail, Lock, User, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
    const { login, register } = useAuth();
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
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
        } else {
            result = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.role
            );
        }

        if (result.success) {
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
                            disabled={loading}
                            onClick={() => setMode("login")}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "login"
                                ? "bg-white text-cyan-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Login
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => setMode("register")}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "register"
                                ? "bg-white text-cyan-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "register" && (
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

                        {mode === "register" && (
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    name="role"
                                    value={formData.role}
                                    disabled={loading}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none transition-all disabled:opacity-50"
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all transform active:scale-95 duration-200 mt-4 disabled:opacity-70 flex items-center justify-center space-x-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            <span>{mode === "login" ? "Sign In" : "Register Now"}</span>
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
