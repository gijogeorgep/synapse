import React from "react";
import tutorsImg from "../assets/tutors_img.png";
import { Languages } from "lucide-react";
import useGsapReveal from "../hooks/useGsapReveal";
import synapsespeaksyou  from "../assets/synapse speaks you title.png";
const TutorsMultilanguage = () => {
  const scopeRef = useGsapReveal();

  return (
    <section
      ref={scopeRef}
      className="relative pt-24 md:pt-32 overflow-hidden min-h-[800px] flex flex-col items-center justify-end bg-slate-50"
    >
      {/* Scattered Bluish Gradient Blobs */}
      <div className="absolute top-1/4 left-[-10%] w-[50%] h-[50%] bg-cyan-400/20 rounded-full blur-[100px] animate-pulse pointer-events-none z-0"></div>
      <div className="absolute top-1/2 right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px] animate-pulse transition-delay-1000 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-1/4 w-[60%] h-[60%] bg-sky-300/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center relative z-10 pt-8 md:pt-12">
        {/* Header Section - Multilanguage Class System */}
        <div className="text-center mb-16 relative max-w-4xl mx-auto">
          <div
            data-gsap="reveal"
            data-y="18"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100/50 border border-cyan-200 text-cyan-700 text-[10px] font-bold uppercase tracking-widest mb-6 leading-none"
          >
            <Languages size={14} className="animate-pulse" />
            Pinnacle of Personalized Learning
          </div>
          <h2
            data-gsap="reveal"
            data-y="28"
            data-delay="0.08"
            className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tighter font-['Outfit'] leading-[0.9]"
          >
            Elite{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
              Multilanguage
            </span>{" "}
            <br />
            Class System
          </h2>
          <p
            data-gsap="reveal"
            data-y="30"
            data-delay="0.16"
            className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-['Plus_Jakarta_Sans']"
          >
            At Synapse Edu Hub, we believe that deep understanding happens when
            you learn in the language of your heart. Our Elite Multilingual
            Class System offers a premium, high-tier educational experience for
            students. Whether it is{" "}
            <span className="text-slate-800 font-bold">
              Malayalam, Hindi, Tamil, Telugu, or English
            </span>
            , we provide top-tier instruction across all syllabi. This system is
            designed for students who seek the highest standards of academic
            coaching without language being a barrier to their success.
          </p>

          {/* Supported Language Display */}
          <div className="flex flex-wrap justify-center gap-3">
            {["Malayalam", "Tamil", "Hindi", "English"].map((lang, index) => (
              <div
                key={lang}
                data-gsap="reveal"
                data-y="18"
                data-delay={String(0.24 + index * 0.06)}
                className="px-6 py-2.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 text-slate-600 font-bold text-xs hover:border-cyan-400 transition-all duration-300 cursor-default hover:scale-105 flex items-center gap-2 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:bg-cyan-400 transition-colors shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                {lang}
              </div>
            ))}
          </div>

          {/* Synapse Speaks You Image */}
          <div className="mt-0 flex justify-center" data-gsap="reveal" data-y="18" data-delay="0.32">
            <img
              src={synapsespeaksyou}
              alt="Synapse Speaks You"
              className="w-full max-w-xl object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* IMAGE SHOWCASE */}
        <div className="relative flex items-center justify-center w-full max-w-6xl mx-auto mt-0 px-2 sm:px-6">
          <div
            data-gsap="reveal"
            data-y="48"
            data-scale="0.96"
            data-delay="0.28"
            className="relative w-full max-w-4xl lg:max-w-5xl"
          >
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-cyan-400/10 blur-[80px] rounded-full scale-90 animate-pulse pointer-events-none"></div>
            <div
              data-gsap="reveal"
              data-clip="true"
              data-y="0"
              data-delay="0.28"
              className="relative overflow-hidden rounded-[2rem]"
            >
              <img
                src={tutorsImg}
                alt="Expert Multilanguage Tutors"
                className="w-full h-auto object-contain relative z-10 hover:scale-105 transition-all duration-[1200ms] ease-out drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default TutorsMultilanguage;
