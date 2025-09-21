import React from "react";
import { BookOpen, GraduationCap, Lightbulb } from "lucide-react";
import heroimg from "../assets/heroimg.png";

const Hero = () => {
  return (
    <section className="w-full flex items-center justify-center bg-gradient-to-b from-cyan-100 to-cyan-50 px-2 md:px-6 pt-24 mt-10">
      <div className="relative w-[95%] max-w-[1600px] bg-gradient-to-r from-cyan-800 via-cyan-700 to-sky-500 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden shadow-2xl min-h-[80vh] flex items-center">
        {/* Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10 w-full">
          {/* Left: Text */}
          <div className="space-y-5 animate-fadeInUp">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-wide leading-tight drop-shadow-lg">
              SYNAPSE EDU HUB
            </h1>

            <h2 className="text-xl md:text-3xl font-light leading-snug">
              Nurturing Potential, Navigating Future
            </h2>

            <p className="text-base md:text-lg font-normal opacity-90 max-w-md">
              At Synapse Edu Hub, we believe every student deserves the right
              guidance to achieve academic success. Our tailored programs help
              learners build strong foundations, gain confidence, and excel in
              their studies.
            </p>

            <button className="mt-4 px-6 py-3 rounded-full bg-white text-cyan-700 font-bold text-lg shadow-md hover:bg-gray-200 hover:scale-105 transition-all duration-300">
              Get Started
            </button>

            {/* Educational Icons */}
            <div className="flex gap-5 mt-6 text-white">
              <div className="flex items-center gap-2">
                <GraduationCap size={28} className="animate-bounce" />
                <span className="text-base">Guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={28} className="animate-pulse" />
                <span className="text-base">Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb size={28} className="animate-spin-slow" />
                <span className="text-base">Ideas</span>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative flex justify-center md:justify-end">
            <img
              src={heroimg}
              alt="Main Graphic"
              className="w-64 md:w-80 lg:w-96 h-auto rounded-full shadow-xl animate-float hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
