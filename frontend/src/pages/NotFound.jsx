import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Compass, Home, MessageCircle, SearchX } from "lucide-react";

const NotFound = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const quickLinks = [
    {
      title: "Back To Home",
      description: "Return to the main website and continue browsing normally.",
      to: "/",
      icon: Home,
      accent: "from-cyan-500 to-sky-600",
    },
    {
      title: "Explore Programs",
      description: "See the learning paths and academic programs we currently offer.",
      to: "/#programs",
      icon: Compass,
      accent: "from-emerald-500 to-cyan-600",
    },
    {
      title: "Contact Support",
      description: "Reach our team if you expected a page here or need help.",
      to: "/#contact",
      icon: MessageCircle,
      accent: "from-orange-500 to-rose-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <section className="relative overflow-hidden bg-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0">
          <div className="absolute left-[-8%] top-[-10%] h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl" />
          <div className="absolute bottom-[-12%] right-[-6%] h-96 w-96 rounded-full bg-indigo-100/70 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
          <div
            className={`grid items-center gap-10 lg:grid-cols-[1.2fr,0.8fr] transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-rose-700">
                <SearchX className="h-4 w-4" />
                404 Error
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-black leading-[0.92] tracking-tighter text-slate-900 md:text-7xl">
                  Page not found,
                  <br />
                  <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                    maybe the URL is wrong
                  </span>
                </h1>
                <p className="max-w-2xl text-lg font-medium leading-relaxed text-slate-600 md:text-xl">
                  The page you tried to open does not exist, may have been
                  moved, or the web address may have been typed incorrectly.
                  You can jump back to the main website, explore programs, or
                  contact the Synapse team for help.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black uppercase tracking-[0.22em] text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-cyan-700"
                >
                  Go Home
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-cyan-100 bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.22em] text-cyan-700 shadow-sm transition-all hover:-translate-y-1 hover:border-cyan-200 hover:shadow-md"
                >
                  About Synapse
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-cyan-100 via-sky-100 to-indigo-100 blur-2xl opacity-70" />
              <div className="relative rounded-[3rem] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] md:p-10">
                <div className="flex items-end gap-4">
                  <span className="text-7xl font-black tracking-tighter text-slate-900 md:text-8xl">
                    404
                  </span>
                  <span className="mb-3 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-700">
                    Not Found
                  </span>
                </div>

                <div className="mt-8 rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Requested Path
                  </p>
                  <p className="mt-3 break-all text-sm font-bold text-slate-700">
                    {location.pathname}
                  </p>
                </div>

                <div className="mt-6 space-y-3 text-sm leading-relaxed text-slate-500">
                  <p>Try checking for spelling mistakes in the URL.</p>
                  <p>Use the navigation menu to return to a valid page.</p>
                  <p>If you followed an old link, the page may have changed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-white shadow-lg`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-900">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
                  {item.description}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-700">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
