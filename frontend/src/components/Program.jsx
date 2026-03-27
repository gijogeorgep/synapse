import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  BookOpen,
  Clock,
  BarChart3
} from "lucide-react";
import { getPrograms } from "../api/services";

const iconMap = {
  Zap,
  BarChart3,
  Users,
  BookOpen,
  Sparkles,
  Clock
};

const ProgramCard = ({ program, index }) => {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 80);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} transition-all duration-700 ease-out`}
    >
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48">
          <img
            src={program.imageUrl || "https://placehold.co/400x200/e2e8f0/94a3b8?text=Program"}
            alt={program.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            {program.badge && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg mb-2 inline-block">
                {program.badge}
              </span>
            )}
            <h3 className="text-xl font-bold">{program.title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {program.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {program.features.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                <CheckCircle2 className="w-3 h-3 text-cyan-500" />
                {f}
              </div>
            ))}
            {program.features.length > 3 && (
              <div className="bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500">
                +{program.features.length - 3} more
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate(`/programs/${program._id}`)}
            className="mt-auto w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest text-white transition-all duration-300 active:scale-95 shadow-lg hover:opacity-90 cursor-pointer"
            style={{ background: program.gradient || "linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)" }}
          >
            <span className="flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};




const Program = () => {
  const headerRef = useRef(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchProgramsData = async () => {
      try {
        const data = await getPrograms();
        setPrograms(data);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };

    fetchProgramsData();

    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const allPrograms = programs;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@800;900&display=swap');

        .programs-section {
          font-family: 'Plus Jakarta Sans', sans-serif;
          width: 100%;
          min-height: 100vh;
          background: #f8fafc;
          padding: 120px 24px 140px;
          position: relative;
        }

        /* Ambient background enhancements */
        .ambient-orb {
          position: absolute;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }

        .orb-1 { top: -200px; right: -200px; background: #06b6d4; }
        .orb-2 { bottom: -200px; left: -200px; background: #0ea5e9; }

        .programs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .prog-card {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          will-change: transform;
        }

        .header-anim {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .header-anim.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 900px) {
          .programs-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .programs-section {
            padding: 80px 20px 100px;
          }
        }
        @media (max-width: 640px) {
          .programs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="programs-section">
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />

        <div ref={headerRef} className="text-center mb-20 relative z-10">
          <div className={`header-anim ${headerVisible ? "visible" : ""}`}>
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] text-cyan-600 bg-cyan-50 border border-cyan-100 rounded-full uppercase">
              Curated Opportunities
            </span>
          </div>
          <h1 className={`header-anim ${headerVisible ? "visible" : ""} text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight font-['Outfit']`} style={{ transitionDelay: '100ms' }}>
            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Learning Journey</span>
          </h1>
          <p className={`header-anim ${headerVisible ? "visible" : ""} text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed`} style={{ transitionDelay: '200ms' }}>
            Explore academic programs tailored specifically for diverse educational goals, providing a clear path to excellence and personal growth.
          </p>
        </div>

        <div className="programs-grid">
          {programs.map((program, index) => (
            <ProgramCard key={program._id || index} program={program} index={index} />
          ))}
        </div>
      </section>
    </>
  );
};

export default Program;
