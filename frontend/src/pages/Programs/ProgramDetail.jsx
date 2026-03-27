import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    Zap,
    BarChart3,
    Users,
    BookOpen,
    Sparkles,
    Clock,
    ChevronRight,
    Star,
    PhoneCall,
    FileText,
    ClipboardList,
    Video
} from "lucide-react";
import { getProgramById } from "../../api/services";

const iconMap = {
    Zap,
    BarChart3,
    Users,
    BookOpen,
    Sparkles,
    Clock,
    FileText,
    ClipboardList,
    Video,
    CheckCircle2,
};

// Icon → gradient color themes for offering cards
const offeringThemes = {
    BookOpen:      { bg: "from-cyan-50 to-sky-50",    border: "border-cyan-100",    icon: "text-cyan-600",    accent: "#0891b2" },
    FileText:      { bg: "from-indigo-50 to-blue-50", border: "border-indigo-100",  icon: "text-indigo-600",  accent: "#4338ca" },
    ClipboardList: { bg: "from-violet-50 to-purple-50",border: "border-violet-100", icon: "text-violet-600",  accent: "#7c3aed" },
    Video:         { bg: "from-rose-50 to-pink-50",   border: "border-rose-100",    icon: "text-rose-600",    accent: "#e11d48" },
    Users:         { bg: "from-emerald-50 to-teal-50",border: "border-emerald-100", icon: "text-emerald-600", accent: "#059669" },
    BarChart3:     { bg: "from-amber-50 to-yellow-50",border: "border-amber-100",   icon: "text-amber-600",   accent: "#d97706" },
    Zap:           { bg: "from-orange-50 to-amber-50",border: "border-orange-100",  icon: "text-orange-600",  accent: "#ea580c" },
    CheckCircle2:  { bg: "from-lime-50 to-green-50",  border: "border-lime-100",    icon: "text-lime-600",    accent: "#65a30d" },
};
const defaultTheme = { bg: "from-slate-50 to-slate-100", border: "border-slate-100", icon: "text-slate-500", accent: "#64748b" };

const ProgramDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                setLoading(true);
                const data = await getProgramById(id);
                setProgram(data);
            } catch (err) {
                setError("Program not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchProgram();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Loading program details...</p>
                </div>
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-2xl font-bold text-slate-400 mb-4">Program not found</p>
                    <button onClick={() => navigate("/")} className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const ProgramIcon = iconMap[program.iconName] || Zap;
    const gradient = program.gradient || "linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)";
    const accentColor = program.accentColor || "#06b6d4";
    const heroImage = program.detailImageUrl || program.imageUrl || null;
    const offerings = program.offerings || [];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative h-[65vh] min-h-[480px] overflow-hidden">
                {heroImage ? (
                    <img src={heroImage} alt={program.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full" style={{ background: gradient }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${accentColor}40, transparent)` }} />

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-8 left-6 md:left-12 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/20 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-14">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            {program.badge && (
                                <span className="px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-white bg-white/20 backdrop-blur-md border border-white/20 rounded-full uppercase">
                                    {program.badge}
                                </span>
                            )}
                            {program.subtitle && (
                                <span className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-white/90 bg-white/10 backdrop-blur-md border border-white/10 rounded-full uppercase tracking-widest">
                                    <ProgramIcon className="w-3 h-3" />
                                    {program.subtitle}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
                            {program.title}
                        </h1>
                        {program.tagline && (
                            <p className="text-lg md:text-2xl font-medium text-white/80 max-w-2xl">
                                {program.tagline}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Offerings Banner — shown only if offerings exist */}
            {offerings.length > 0 && (
                <div className="bg-white border-b border-slate-100 py-10 px-6">
                    <div className="max-w-5xl mx-auto">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">What You Get With This Program</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {offerings.map((offering, i) => {
                                const OfferingIcon = iconMap[offering.icon] || BookOpen;
                                const theme = offeringThemes[offering.icon] || defaultTheme;
                                return (
                                    <div
                                        key={i}
                                        className={`p-5 rounded-[1.5rem] bg-gradient-to-br ${theme.bg} border ${theme.border} flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white shadow-sm`}>
                                            <OfferingIcon className={`w-5 h-5 ${theme.icon}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 leading-tight">{offering.title}</p>
                                            {offering.description && (
                                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{offering.description}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left: Main Details */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Description */}
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">About This Program</h2>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            {program.description || "No description available."}
                        </p>
                    </div>

                    {/* Features */}
                    {program.features && program.features.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-6">Key Highlights</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {program.features.map((feature, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                    >
                                        <div className="p-1.5 rounded-full mt-0.5 shrink-0" style={{ background: `${accentColor}20` }}>
                                            <CheckCircle2 className="w-4 h-4" style={{ color: accentColor }} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Why Choose Us */}
                    <div className="p-8 rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500" />
                            Why Choose Synapse?
                        </h2>
                        <div className="space-y-4">
                            {[
                                "Expert educators with years of proven results",
                                "Personalized attention for every student",
                                "Comprehensive study materials & resources",
                                "Regular assessments and progress tracking",
                                "Flexible scheduling to suit your needs",
                            ].map((point, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <ChevronRight className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                                    <span className="text-slate-600 text-sm font-medium">{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Sticky CTA */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-4">
                        {/* CTA Card */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                            <div className="h-3 w-full" style={{ background: gradient }} />
                            <div className="p-8">
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to Join?</h3>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                    Take the first step toward academic excellence. Enroll now or reach out to learn more.
                                </p>
                                <a
                                    href="#contact"
                                    onClick={(e) => { e.preventDefault(); navigate("/#contact"); }}
                                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-white text-sm uppercase tracking-widest shadow-lg hover:opacity-90 active:scale-95 transition-all mb-3"
                                    style={{ background: gradient }}
                                >
                                    Enroll Now <ChevronRight className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => navigate("/#contact")}
                                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-slate-600 text-sm border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    <PhoneCall className="w-4 h-4" />
                                    Contact Us
                                </button>
                            </div>
                        </div>

                        {/* Quick Highlights */}
                        {program.features && program.features.length > 0 && (
                            <div className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Highlights</h4>
                                <div className="space-y-3">
                                    {program.features.slice(0, 5).map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramDetail;
