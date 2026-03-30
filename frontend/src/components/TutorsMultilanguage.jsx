import React, { useRef, useEffect, useState } from "react";
import tutorsImg from "../assets/tutors_img.png";
import { Languages, Globe, BookOpen } from "lucide-react";

const TutorsMultilanguage = () => {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.2 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative pt-24 md:pt-32 overflow-hidden min-h-[800px] flex flex-col items-center justify-end bg-slate-50"
        >
            {/* Scattered Bluish Gradient Blobs */}
            <div className="absolute top-1/4 left-[-10%] w-[50%] h-[50%] bg-cyan-400/20 rounded-full blur-[100px] animate-pulse pointer-events-none z-0"></div>
            <div className="absolute top-1/2 right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px] animate-pulse transition-delay-1000 pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] left-1/4 w-[60%] h-[60%] bg-sky-300/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

            <div className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center relative z-10 pt-8 md:pt-12">

                {/* Header Section - Multilanguage Class System */}
                <div className="text-center mb-16 relative max-w-4xl mx-auto">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100/50 border border-cyan-200 text-cyan-700 text-[10px] font-bold uppercase tracking-widest mb-6 leading-none transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <Languages size={14} className="animate-pulse" />
                        Pinnacle of Personalized Learning
                    </div>
                    <h2 className={`text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tighter font-['Outfit'] leading-[0.9] transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Multilanguage</span> <br />
                        Class System
                    </h2>
                    <p className={`text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-['Plus_Jakarta_Sans'] transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        Synapse Hub introduces a revolutionary system where students can master competitive exams like <span className="text-slate-800 font-bold">NEET & JEE</span> in their own regional languages, including <span className="text-cyan-600 font-bold text-base">Malayalam, Tamil, and Hindi</span>.
                    </p>

                    {/* Supported Language Display */}
                    <div className={`flex flex-wrap justify-center gap-3 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {['Malayalam', 'Tamil', 'Hindi', 'English'].map((lang, index) => (
                            <div key={lang} className={`px-6 py-2.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 text-slate-600 font-bold text-xs hover:border-cyan-400 transition-all duration-300 cursor-default hover:scale-105 flex items-center gap-2 group ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 120 + 450}ms` }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:bg-cyan-400 transition-colors shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                                {lang}
                            </div>
                        ))}
                    </div>
                </div>

                {/* IMAGE SHOWCASE */}
                <div className="relative flex items-center justify-center w-full max-w-6xl mx-auto mt-12 px-2 sm:px-6">
                    <div className={`relative w-full max-w-4xl lg:max-w-5xl ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
                        {/* Subtle background glow */}
                        <div className="absolute inset-0 bg-cyan-400/10 blur-[80px] rounded-full scale-90 animate-pulse pointer-events-none"></div>
                        <img
                            src={tutorsImg}
                            alt="Expert Multilanguage Tutors"
                            className="w-full h-auto object-contain relative z-10 hover:scale-105 transition-transform duration-700 ease-out drop-shadow-2xl"
                        />
                    </div>
                </div>

            </div>

            {/* ANIMATIONS */}
            <style jsx>{`
        @keyframes slide-in-left {
          from { transform: translateX(-80px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(80px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes zoom-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-left { animation: slide-in-left 1s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out forwards; }
        .animate-zoom-in { animation: zoom-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 1.2s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
      `}</style>
        </section>
    );
};

export default TutorsMultilanguage;
