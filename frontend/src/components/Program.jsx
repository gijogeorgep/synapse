import React, { useEffect, useRef, useState } from "react";
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
import { getPublicClassrooms } from "../api/services";
import primeone from "../assets/primeone.png";
import cluster from "../assets/cluster.png";
import planb from "../assets/planb.png";
import deeprrot from "../assets/deep root.png";


const programs = [
  {
    img: primeone,
    objPos: "object-[50%_49%]",
    tag: "PRIME ONE",
    tagline: "Personalized Learning, Maximum Focus",
    subtitle: "Individual Tuition Program",
    desc: "Comprehensive academic support with 1-on-1 attention for students in classes 4–10.",
    features: [
      "1-on-1 Personalized Attention",
      "Customized Learning Path",
      "Instant Doubt Resolution",
      "Flexible Smart Scheduling",
      "Focused Exam Prep",
      "Digital Progress Tracking",
    ],
    gradient: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)",
    glowColor: "rgba(6,182,212,0.4)",
    accentColor: "#06b6d4",
    badge: "Most Popular",
    icon: Zap,
    pill: { bg: "rgba(6,182,212,0.1)", color: "#0891b2", border: "rgba(6,182,212,0.2)" },
  },
  {
    img: planb,
    objPos: "object-[50%_30%]",
    tag: "PLAN B",
    tagline: "Smart planning for stress-free success",
    subtitle: "Exclusive Revision Program",
    desc: "Intensive exam-oriented revision designed specifically for Class 10+ students.",
    features: [
      "Structured Macro Revision",
      "Exam-Oriented Strategies",
      "Deep Concept Reinforcement",
      "Time Management Mastery",
      "Daily Practice Sessions",
      "Performance Evaluation",
    ],
    gradient: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #14b8a6 100%)",
    glowColor: "rgba(20,184,166,0.4)",
    accentColor: "#14b8a6",
    badge: "Exam Ready",
    icon: BarChart3,
    pill: { bg: "rgba(20,184,166,0.1)", color: "#0d9488", border: "rgba(20,184,166,0.2)" },
  },
  {
    img: cluster,
    objPos: "object-[50%_28%]",
    tag: "CLUSTER",
    tagline: "Together Towards Excellence",
    subtitle: "Collaborative Learning",
    desc: "Compact batch specialized learning that bridges peer interaction and expert guidance.",
    features: [
      "Ultra-Compact Batches",
      "Active Peer Learning",
      "Dynamic Doubt Sessions",
      "Interactive Class Design",
      "Focused Curriculum Map",
      "Continuous Monitoring",
    ],
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #3b82f6 100%)",
    glowColor: "rgba(59,130,246,0.4)",
    accentColor: "#3b82f6",
    badge: "Best Value",
    icon: Users,
    pill: { bg: "rgba(59,130,246,0.1)", color: "#2563eb", border: "rgba(59,130,246,0.2)" },
  },
  {
    img: deeprrot,
    objPos: "object-[50%_38%]",
    tag: "DEEP ROOTS",
    tagline: "Foundation for a brighter future",
    subtitle: "Intensive Bridge Course",
    desc: "A transition program designed to strengthen core concepts before the new academic year.",
    features: [
      "Core Subject Strengthening",
      "Gap Identification Tool",
      "Small Foundation Batches",
      "Accelerated Revision",
      "Transition Counseling",
      "Confidence Building",
    ],
    gradient: "linear-gradient(135deg, #075985 0%, #0369a1 50%, #0ea5e9 100%)",
    glowColor: "rgba(14,165,233,0.4)",
    accentColor: "#0ea5e9",
    badge: "Essentials",
    icon: BookOpen,
    pill: { bg: "rgba(14,165,233,0.1)", color: "#0369a1", border: "rgba(14,165,233,0.2)" },
  },
];

const ProgramCard = ({ program, index }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
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
      className={`relative group ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} transition-all duration-700 ease-out`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Dynamic Background Shadow */}
      <div
        className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      <div className="relative bg-gradient-to-br from-white via-cyan-50/40 to-sky-100/60 backdrop-blur-xl border border-white/40 h-full flex flex-col rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-cyan-200/50 transition-all duration-500 overflow-hidden">
        {/* Compact Image Section */}
        <div className="relative h-40 overflow-hidden m-3 rounded-[1.5rem]">
          <img
            src={program.img}
            alt={program.tag}
            className={`w-full h-full object-cover transition-transform duration-1000 ${hovered ? 'scale-110' : 'scale-100'} ${program.objPos}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

          <div className="absolute top-3 right-3">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <span className="text-[9px] font-black text-white uppercase tracking-wider">{program.badge}</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4">
            <h3 className="text-xl font-black text-white tracking-tighter leading-none">{program.tag}</h3>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-6 pt-2 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg" style={{ background: program.pill.bg }}>
              <program.icon className="w-3.5 h-3.5" style={{ color: program.pill.color }} />
            </div>
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{program.subtitle}</span>
          </div>

          <p className="text-[13px] text-slate-500 leading-relaxed mb-5 font-medium line-clamp-2">
            {program.desc}
          </p>

          <div className="space-y-2 mb-6">
            {program.features.slice(0, 4).map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: program.accentColor }} />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <button
            className="mt-auto group/btn flex items-center justify-center gap-2 w-full py-3 rounded-xl transition-all duration-300 active:scale-95 text-white font-black text-[11px] uppercase tracking-widest shadow-lg overflow-hidden relative"
            style={{ background: program.gradient }}
          >
            <span className="relative z-10">Get Started</span>
            <ArrowRight className="relative z-10 w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
};


const Program = () => {
  const headerRef = useRef(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [dynamicPrograms, setDynamicPrograms] = useState([]);

  useEffect(() => {
    const fetchDynamicPrograms = async () => {
      try {
        const data = await getPublicClassrooms();
        if (Array.isArray(data)) {
          // Map backend classrooms to the ProgramCard format
          const mapped = data.filter(c => c.showOnHome).map((c, i) => ({
            img: c.imageUrl || primeone, // fallback to a known image if none provided
            objPos: "object-center",
            tag: c.name,
            tagline: c.type === 'Other' ? `${c.className} ${c.board}` : c.type,
            subtitle: c.type,
            desc: c.description || `Specialized ${c.type} coaching program designed for academic success in ${c.board || 'various'} boards.`,
            features: [
              "Expert Guidance",
              "Personalized Support",
              "Comprehensive Materials",
              "Regular Assessments"
            ],
            gradient: i % 2 === 0
              ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
              : "linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)",
            glowColor: "rgba(6,182,212,0.4)",
            accentColor: "#06b6d4",
            badge: "New Batch",
            icon: Sparkles,
            pill: { bg: "rgba(6,182,212,0.1)", color: "#0891b2", border: "rgba(6,182,212,0.2)" },
          }));
          setDynamicPrograms(mapped);
        }
      } catch (error) {
        console.error("Error fetching dynamic programs:", error);
      }
    };

    fetchDynamicPrograms();

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

  const allPrograms = [...programs, ...dynamicPrograms];

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
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          max-width: 1100px;
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

        @media (max-width: 640px) {
          .programs-grid {
            grid-template-columns: 1fr;
          }
          .programs-section {
            padding: 80px 20px 100px;
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
          {allPrograms.map((program, index) => (
            <ProgramCard key={program.tag + index} program={program} index={index} />
          ))}
        </div>
      </section>
    </>
  );
};

export default Program;
