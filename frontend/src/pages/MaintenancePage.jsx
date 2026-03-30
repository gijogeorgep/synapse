import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Home, Wrench } from "lucide-react";

const MaintenancePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <section className="relative flex min-h-screen items-center justify-center px-4 py-20 md:px-8">
        <div className="absolute inset-0">
          <div className="absolute left-[-8%] top-[-10%] h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl" />
          <div className="absolute bottom-[-12%] right-[-8%] h-96 w-96 rounded-full bg-amber-200/50 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div
          className={`relative z-10 w-full max-w-3xl rounded-[3rem] border border-white/70 bg-white/90 p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-1000 md:p-14 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-cyan-500 shadow-2xl">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white">
              <Clock3 className="h-8 w-8 text-slate-900" />
              <div className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
                <Wrench className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-amber-700">
            Maintenance Mode
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tighter text-slate-900 md:text-6xl">
            Under
            <span className="bg-gradient-to-r from-amber-500 to-cyan-600 bg-clip-text text-transparent">
              {" "}Maintenance
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-slate-500 md:text-lg">
            We’ll be back shortly.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/"
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-7 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition-all hover:-translate-y-1 hover:bg-cyan-700"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
            <a
              href="mailto:synapseeduhub@gmail.com"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.22em] text-slate-700 transition-all hover:-translate-y-1 hover:border-cyan-200 hover:text-cyan-700"
            >
              Contact Us
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MaintenancePage;
