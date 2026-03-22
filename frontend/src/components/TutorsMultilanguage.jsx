import React from "react";
import heroImg from "../assets/heroimg.png";
import tchr1 from "../assets/tchr1.png";
import tchr2 from "../assets/tchr2.png";
import tchr3 from "../assets/tchr3.png";
import tchr4 from "../assets/tchr4.png";
import { Languages, Globe, BookOpen } from "lucide-react";

const TutorsMultilanguage = () => {
    return (
        <section
            className="relative pt-24 md:pt-32 overflow-hidden min-h-[800px] flex flex-col items-center justify-end bg-slate-50"
        >
            {/* Scattered Bluish Gradient Blobs */}
            <div className="absolute top-1/4 left-[-10%] w-[50%] h-[50%] bg-cyan-400/20 rounded-full blur-[100px] animate-pulse pointer-events-none z-0"></div>
            <div className="absolute top-1/2 right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px] animate-pulse transition-delay-1000 pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] left-1/4 w-[60%] h-[60%] bg-sky-300/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

            <div className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center relative z-10 pt-8 md:pt-12">

                {/* Header Section - Multilanguage Class System */}
                <div className="text-center mb-16 animate-fade-in relative max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100/50 border border-cyan-200 text-cyan-700 text-[10px] font-bold uppercase tracking-widest mb-6 leading-none">
                        <Languages size={14} className="animate-pulse" />
                        Pinnacle of Personalized Learning
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tighter font-['Outfit'] leading-[0.9]">
                        Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Multilanguage</span> <br />
                        Class System
                    </h2>
                    <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-['Plus_Jakarta_Sans']">
                        Synapse Hub introduces a revolutionary system where students can master competitive exams like <span className="text-slate-800 font-bold">NEET & JEE</span> in their own regional languages, including <span className="text-cyan-600 font-bold text-base">Malayalam, Tamil, and Hindi</span>.
                    </p>

                    {/* Supported Language Display */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {['Malayalam', 'Tamil', 'Hindi', 'English'].map((lang) => (
                            <div key={lang} className="px-6 py-2.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 text-slate-600 font-bold text-xs hover:border-cyan-400 transition-all duration-300 cursor-default hover:scale-105 flex items-center gap-2 group">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:bg-cyan-400 transition-colors shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                                {lang}
                            </div>
                        ))}
                    </div>
                </div>

                {/* IMAGE SHOWCASE */}
                <div className="relative flex items-end justify-center w-full -space-x-8 sm:-space-x-16 md:-space-x-28 lg:-space-x-40 ">

                    {/* LEFT FAR */}
                    <div className="mt-8 z-10 animate-slide-in-left">
                        <img
                            src={tchr1}
                            alt="Tutor 1"
                            className="w-20 sm:w-28 md:w-56 lg:w-64 object-cover 
               transition-all duration-700 ease-in-out
               hover:scale-105 cursor-pointer outline-none"
                        />
                    </div>

                    {/* LEFT */}
                    <div
                        className="mt-8 z-20 animate-slide-in-left"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <img
                            src={tchr2}
                            alt="Tutor 2"
                            className="w-20 sm:w-32 md:w-56 lg:w-64 object-cover ml-0 md:ml-18
               transition-all duration-700 ease-in-out
               hover:scale-105 cursor-pointer outline-none"
                        />
                    </div>

                    {/* CENTER HERO */}
                    <div className="z-40 animate-zoom-in">
                        <img
                            src={heroImg}
                            alt="Main Mentor"
                            className="w-48 sm:w-48 md:w-[32rem] lg:w-[42rem] object-cover
               transition-all duration-700 ease-in-out
               hover:scale-110 scale-125 sm:scale-110 cursor-pointer outline-none"
                        />
                    </div>

                    {/* RIGHT */}
                    <div
                        className="mt-8 z-20 animate-slide-in-right"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <img
                            src={tchr3}
                            alt="Tutor 3"
                            className="w-20 sm:w-32 md:w-56 lg:w-64 object-cover mr-0 md:mr-14
               transition-all duration-700 ease-in-out
               hover:scale-105 cursor-pointer outline-none"
                        />
                    </div>

                    {/* RIGHT FAR */}
                    <div className="mt-8 z-10 animate-slide-in-right">
                        <img
                            src={tchr4}
                            alt="Tutor 4"
                            className="w-20 sm:w-28 md:w-56 lg:w-64 object-cover
               transition-all duration-700 ease-in-out
               hover:scale-105 cursor-pointer outline-none"
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
        .animate-slide-in-left { animation: slide-in-left 1s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out forwards; }
        .animate-zoom-in { animation: zoom-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 1.2s ease-out forwards; }
      `}</style>
        </section>
    );
};

export default TutorsMultilanguage;