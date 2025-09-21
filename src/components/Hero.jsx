import React from "react";
import { BookOpen, GraduationCap, Lightbulb, ArrowRight } from "lucide-react";
import heroimg from "../assets/heroimg.png";
import herobg from "../assets/herobg.png";

const Hero = () => {
  return (
    <section className="relative w-full flex items-center justify-center px-2 md:px-6 pt-24 mt-10 bg-gradient-to-b from-cyan-50 to-cyan-100">
      {/* Main Container (Full Viewport Height) */}
      <div className="relative w-[95%] max-w-[1600px] rounded-[3rem] h-[100vh] flex items-center backdrop-blur-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/30 shadow-2xl overflow-hidden">
        
        {/* Enhanced Background with Overlay */}
        <div className="absolute inset-0 w-full h-full rounded-[3rem] overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40"
            style={{
              backgroundImage: `url(${herobg})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/40 via-blue-900/30 to-blue-800/40"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-400/10 to-blue-500/20 animate-pulse"></div>
        </div>

        {/* Inner Content Container */}
        <div className="relative w-full h-full p-8 md:p-16 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
            
            {/* Left Content */}
            <div className="space-y-8 text-white">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                  <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                    SYNAPSE
                  </span>
                  <br />
                  <span className="text-white drop-shadow-2xl">EDU HUB</span>
                </h1>
                
                <h2 className="text-2xl md:text-4xl font-light leading-relaxed text-cyan-100 drop-shadow-lg">
                  Nurturing Potential, Navigating Future
                </h2>
              </div>

              <p className="text-lg md:text-xl font-medium text-white/90 max-w-xl leading-relaxed drop-shadow-md">
                Transform your learning journey with our innovative educational platform. 
                We provide personalized guidance, expert mentorship, and cutting-edge resources 
                to help you achieve academic excellence.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 transition-all duration-300 border border-white/20">
                  Get Started Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                
                <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md text-white font-semibold text-lg border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-xl">
                  Learn More
                </button>
              </div>

              {/* Feature Icons */}
              <div className="flex flex-wrap gap-4 pt-6">
                <div className="group flex items-center gap-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/30 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="p-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500">
                    <GraduationCap size={24} className="text-white" />
                  </div>
                  <span className="text-white font-bold text-base">Guidance</span>
                </div>
                
                <div className="group flex items-center gap-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/30 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500">
                    <BookOpen size={24} className="text-white" />
                  </div>
                  <span className="text-white font-bold text-base">Learning</span>
                </div>
                
                <div className="group flex items-center gap-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/30 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                    <Lightbulb size={24} className="text-white" />
                  </div>
                  <span className="text-white font-bold text-base">Ideas</span>
                </div>
              </div>
            </div>
            
            {/* Right Image Section */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-5 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-20 w-16 h-16 bg-gradient-to-r from-blue-400/40 to-cyan-500/40 rounded-full blur-lg animate-pulse delay-500"></div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-blue-600/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/40 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-transparent to-blue-500/10 rounded-3xl"></div>
                  
                  <img
                    src={heroimg}
                    alt="Educational Excellence"
                    className="relative w-72 md:w-96 lg:w-[420px] h-auto rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all duration-700 ease-out z-10"
                  />
                  
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-blue-500/50 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-2 h-20 bg-gradient-to-b from-cyan-400 to-transparent rounded-full opacity-60"></div>
        <div className="absolute bottom-10 right-10 w-20 h-2 bg-gradient-to-r from-blue-500 to-transparent rounded-full opacity-60"></div>
      </div>
    </section>
  );
};

export default Hero;
