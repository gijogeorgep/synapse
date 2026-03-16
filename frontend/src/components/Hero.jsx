import React from "react";
import { ArrowRight, PlayCircle, Star, Users, CheckCircle, BookOpen, Lightbulb } from "lucide-react";
import heroimg from "../assets/heroimg.png";

const Hero = () => {
  return (
    <section className="relative w-full bg-slate-50 pt-4 sm:pt-8 md:pt-12 pb-8">
      {/* Background Decorative Elements moved outside to prevent clipping */}
      <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] bg-cyan-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse duration-[3000ms] pointer-events-none"></div>
      <div className="absolute bottom-[0%] right-[-10%] w-[60%] h-[60%] bg-sky-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse duration-[4000ms] pointer-events-none"></div>

      {/* Blue Container Wrapper */}
      <div className="relative w-[94%] sm:w-[96%] max-w-[1400px] mx-auto bg-gradient-to-br from-cyan-900 via-cyan-800 to-sky-700 rounded-[2rem] sm:rounded-[2.5rem] pt-10 sm:pt-16 pb-0 px-6 sm:px-10 lg:px-12 xl:px-20 text-white overflow-hidden shadow-[0_20px_50px_rgb(6,182,212,0.2)]">

        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10 lg:gap-16 relative z-10">

          {/* Left Content Area */}
          <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8 z-10 pb-10 sm:pb-16 lg:pb-24">


            <div className="space-y-4 sm:space-y-5 w-full">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-extrabold text-white leading-[1.2] lg:leading-[1.15] tracking-tight drop-shadow-sm">
                India's Most Focused <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-200">
                  Learning Platform
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-cyan-100 font-normal max-w-xl leading-relaxed mt-2 sm:mt-4 mx-auto lg:mx-0">
                Synapse Edu Hub offers personalized learning experiences, expert mentorship, and comprehensive resources to guide you toward academic success.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4 sm:mt-6">
              <button className="group w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-white text-cyan-900 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-cyan-400/20 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                Start Learning Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-cyan-950/30 text-white border border-cyan-400/30 rounded-xl font-bold text-base sm:text-lg hover:bg-cyan-900/50 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2">
                <PlayCircle size={22} className="text-cyan-300 group-hover:scale-110 transition-transform" />
                Explore Courses
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-t border-cyan-400/20 w-full max-w-md">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-cyan-800 bg-cyan-600 overflow-hidden flex items-center justify-center">
                    <Users size={16} className="text-cyan-200" />
                  </div>
                ))}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-cyan-800 bg-cyan-100 flex items-center justify-center text-[10px] sm:text-xs font-bold text-cyan-900">
                  +10k
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex justify-center sm:justify-start text-amber-300">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-[10px] sm:text-sm text-cyan-100 font-medium mt-0.5">Trusted by students across India</p>
              </div>
            </div>
          </div>

          {/* Right Image Area */}
          <div className="w-full lg:w-[45%] relative flex justify-center lg:justify-end mt-4 sm:mt-8 lg:mt-0">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-7xl">

              {/* Image specific background blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-tr from-cyan-400 to-sky-300 rounded-full blur-[80px] opacity-30 animate-pulse duration-[5000ms]"></div>

              <div className="relative z-10 p-0">
                <img
                  src={heroimg}
                  alt="Students Learning"
                  className="w-full h-auto relative z-10 drop-shadow-2xl animate-float scale-100 md:scale-110 lg:scale-140 xl:scale-160 origin-bottom"
                />

                {/* Floating Stats Cards */}
                <div className="absolute top-10 left-[-20px] sm:left-[-40px] bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-4 hidden sm:flex hover:scale-105 transition-transform cursor-pointer z-20">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-cyan-100 font-semibold uppercase tracking-wider">Pass Rate</p>
                    <p className="text-lg font-bold text-white leading-tight">99.8%</p>
                  </div>
                </div>

                <div className="absolute bottom-16 right-[-20px] sm:right-[10px] bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-4 hidden sm:flex hover:scale-105 transition-transform cursor-pointer z-20">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <Lightbulb size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-cyan-100 font-semibold uppercase tracking-wider">Expertise</p>
                    <p className="text-lg font-bold text-white leading-tight">Top Mentors</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

