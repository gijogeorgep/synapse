import React, { useEffect, useState } from "react";
import logo from "../assets/synapse_logo.png";

const MaintenancePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden">
      
      {/* Crisp Background Shapes (The glass will blur them) */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[55rem] h-[55rem] bg-gradient-to-tl from-indigo-500 to-purple-400 rounded-full" />
        <div className="absolute top-[30%] right-[20%] w-[25rem] h-[25rem] bg-gradient-to-tr from-amber-400 to-orange-400 rounded-full" />
      </div>

      {/* True Full-page Frosted Glass Overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl border-t border-white/50" />

      <div 
        className={`relative z-10 w-full max-w-2xl px-6 text-center transition-all duration-1000 ease-out flex flex-col items-center
          ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
        `}
      >
        {/* Large Logo */}
        <img 
            src={logo} 
            alt="Synapse Connect" 
            className="h-24 md:h-32 mb-12 object-contain drop-shadow-md"
        />

        {/* Minimalist Copy */}
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
          Under Maintenance
        </h1>
        
        <h2 className="text-xl md:text-2xl font-bold text-slate-700 mb-6">
          We'll be back soon.
        </h2>
        
        <p className="text-slate-600 font-medium text-base md:text-lg leading-relaxed max-w-lg mx-auto">
          Synapse Connect is currently undergoing brief maintenance to improve your experience. Thank you for your patience.
        </p>

      </div>
      
    </div>
  );
};

export default MaintenancePage;
