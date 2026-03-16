import { useState } from "react";
import { X, Mail, Lock, User, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
    const { login, register } = useAuth();
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
        phoneNumber: "",
        class: "",
        subjects: [],
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (error) setError("");
    };

    const handleSubjectToggle = (subject) => {
        const updatedSubjects = formData.subjects.includes(subject)
            ? formData.subjects.filter((s) => s !== subject)
            : [...formData.subjects, subject];
        setFormData({ ...formData, subjects: updatedSubjects });
    };

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === "register" && step < 3 && formData.role === "student") {
            nextStep();
            return;
        }

        setLoading(true);
        setError("");

        let result;
        if (mode === "login") {
            result = await login(formData.email, formData.password);
        } else {
            result = await register(formData);
        }

        if (result.success) {
            onClose();
            setStep(1);
        } else {
            setError(result.message || "Something went wrong");
        }
        setLoading(false);
    };

    const classes = ["8", "9", "10"];
    const subjectsList = ["Physics", "Chemistry", "Biology", "Mathematics", "English", "Social Science"];

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
                        {mode === "register" && formData.role === "student" && (
                            <div className="flex justify-center space-x-2 mt-4">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= s ? "bg-cyan-600" : "bg-slate-200"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                        <p className="text-slate-500 mt-2">
                            {mode === "login"
                                ? "Sign in to access your dashboard"
                                : step === 1
                                    ? "Create an account to start learning"
                                    : step === 2
                                        ? "Select your class"
                                        : "Pick your subjects"}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {/* Mode Switcher */}
                    {step === 1 && (
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
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "login" ? (
                            <>
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
                            </>
                        ) : (
                            <>
                                {step === 1 && (
                                    <div className="space-y-4">
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
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                            />
                                        </div>
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
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                placeholder="Phone Number"
                                                required
                                                disabled={loading}
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
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
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <select
                                                name="role"
                                                value={formData.role}
                                                disabled={loading}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none transition-all"
                                            >
                                                <option value="student">Student</option>
                                                <option value="teacher">Teacher</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="grid grid-cols-1 gap-4">
                                        {classes.map((cls) => (
                                            <button
                                                key={cls}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, class: cls })}
                                                className={`p-4 rounded-2xl border-2 transition-all text-left font-semibold ${formData.class === cls
                                                    ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                                                    : "border-slate-100 hover:border-slate-200 text-slate-600"
                                                    }`}
                                            >
                                                Class {cls}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {subjectsList.map((subject) => (
                                            <button
                                                key={subject}
                                                type="button"
                                                onClick={() => handleSubjectToggle(subject)}
                                                className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${formData.subjects.includes(subject)
                                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                                    : "border-slate-100 hover:border-slate-200 text-slate-600"
                                                    }`}
                                            >
                                                {subject}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex space-x-3 mt-6">
                            {mode === "register" && step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading || (mode === "register" && step === 2 && !formData.class) || (mode === "register" && step === 3 && formData.subjects.length === 0)}
                                className="flex-[2] py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all transform active:scale-95 duration-200 disabled:opacity-70 flex items-center justify-center space-x-2"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                <span>
                                    {mode === "login"
                                        ? "Sign In"
                                        : step < 3 && formData.role === "student"
                                            ? "Next Step"
                                            : "Complete Registration"}
                                </span>
                            </button>
                        </div>
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
