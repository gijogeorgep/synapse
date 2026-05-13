import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Show splash for 2 seconds then start fade out
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // After fade out animation (500ms), call onComplete
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-white to-sky-50/50" />

      {/* Animated Shapes for Premium Feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-200/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-200/20 rounded-full blur-[120px] animate-pulse" />

      <div className="relative flex flex-col items-center">
        {/* Logo with Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-3xl animate-pulse scale-150" />
          <img
            src={(window.location.hostname.startsWith('admin') || window.location.port === '5174') ? "/y-admin-512.png" : "/app-icon-512.png"}
            alt="Synapse Logo"
            className="h-32 md:h-48 w-auto object-contain relative animate-logo-in"
          />
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-sky-500 w-full animate-progress-indefinite" />
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-[0.2em] uppercase animate-pulse">
            Initializing Ecosystem
          </p>
        </div>
      </div>

      <style>{`
        @keyframes logo-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-logo-in {
          animation: logo-in 1s ease-out forwards;
        }
        .animate-progress-indefinite {
          animation: progress-indefinite 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
