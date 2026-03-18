import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

const AdminAuth = () => {
    const { login, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await apiClient("/auth/admin/login", {
                method: "POST",
                body: {
                    email: formData.email,
                    password: formData.password
                }
            });

            updateUser(data);
            navigate("/admin/dashboard");
        } catch (err) {
            setError(err || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#050b1a] px-4 py-8 overflow-hidden font-['Outfit',sans-serif]">
            {/* Dynamic Mesh Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-indigo-600/20 blur-[100px] rounded-full animate-pulse delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <button
                    onClick={() => navigate("/")}
                    className="group flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-all duration-300 font-medium"
                >
                    <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Terminal
                </button>

                {/* Glassmorphism Card */}
                <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden p-5 md:p-6 transition-all hover:border-white/20">
                    <div className="text-center mb-4">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                            <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 overflow-hidden">
                                <img src="/synapse favicon.png" alt="Synapse Logo" className="w-10 h-10 object-contain" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                            Synapse <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Edu Hub</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">
                            Administrator Access
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-semibold text-center backdrop-blur-md animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="admin@synapse.com"
                                    required
                                    disabled={loading}
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all text-sm text-white placeholder-slate-600 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all text-sm text-white placeholder-slate-600 font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative overflow-hidden py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-2xl shadow-cyan-500/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-70"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                <span className="relative flex items-center justify-center gap-2">
                                    Authenticate <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-white/5 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">
                                Secure Link • Encrypted
                            </p>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default AdminAuth;
