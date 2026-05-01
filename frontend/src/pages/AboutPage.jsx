import React, { useEffect, useState } from "react";
import {
  Users,
  Target,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
  Zap,
} from "lucide-react";
import amith from "../assets/amith.jpeg";
import logo from "../assets/synapse_logo.png";

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const missionVision = [
    {
      title: "Our Mission",
      desc: "To move beyond the limitations of mass education by building a focused learning ecosystem where every student receives the individual attention they deserve, ensuring that unique potential is nurtured and linguistic barriers are removed",
      icon: Target,
      color: "bg-cyan-500",
      lightColor: "bg-cyan-50",
    },
    {
      title: "Our Vision",
      desc: "To become India's leading personalized learning ecosystem, recognized for academic excellence, linguistic inclusivity, and innovative pedagogical approaches.",
      icon: Lightbulb,
      color: "bg-indigo-500",
      lightColor: "bg-indigo-50",
    },
  ];

  const coreValues = [
    {
      title: "Student-Centric",
      desc: "Every decision we make starts and ends with the student's success.",
      icon: Users,
    },
    {
      title: "Regional Inclusivity",
      desc: "Linguistic diversity is our strength, bringing education to every doorstep.",
      icon: Zap,
    },
    {
      title: "Innovation",
      desc: "Merging traditional mentorship with modern digital learning tools.",
      icon: Zap,
    },
    {
      title: "Integrity",
      desc: "Maintaining the highest standards of transparency and educational ethics.",
      icon: ShieldCheck,
    },
  ];

  const milestones = [
    {
      year: "2023",
      title: "The Inception",
      desc: "Synapse Edu Hub was founded with a vision to bridge the educational gap.",
    },
    {
      year: "2024",
      title: "Regional Expansion",
      desc: "Launched courses in 5+ Indian regional languages.",
    },
    {
      year: "2025",
      title: "Digital Integration",
      desc: "Introduced our comprehensive online learning and assessment portal.",
    },
    {
      year: "2026",
      title: "Nationwide Growth",
      desc: "Trusted by over 10,000 students across various states.",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-cyan-50/50 -skew-x-12 transform origin-top translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div
            className={`max-w-3xl space-y-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-bold uppercase tracking-widest">
              Our Story
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">
                The Next Generation
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
              Synapse Connect isn't just a coaching center; it's a personalized
              learning ecosystem designed to help every student find their
              unique path to success through expert mentorship in their own
              regional language.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {missionVision.map((item, i) => (
              <div
                key={i}
                className="group p-8 md:p-12 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 ${item.lightColor} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}
                >
                  <item.icon
                    className={`w-8 h-8 ${item.title === "Our Mission" ? "text-cyan-600" : "text-indigo-600"}`}
                  />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                  {item.title}
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-100 to-indigo-100 rounded-[3rem] blur-2xl opacity-50" />
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src={amith}
                  alt="Amith Girish"
                  className="w-full aspect-[4/5] object-cover scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900 via-transparent to-transparent">
                  <h3 className="text-white text-3xl font-black font-['Outfit']">
                    Amith Girish
                  </h3>
                  <p className="text-cyan-300 font-bold uppercase tracking-widest text-xs">
                    Founder & CEO, Synapse Edu Hub
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-cyan-600">
                  <span className="h-px w-8 bg-cyan-600" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    Leadership Insight
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                  "Beyond the crowd <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                    A New Era of Learning
                  </span>
                  "
                </h2>
              </div>
              <div className="space-y-6 text-slate-600 text-lg font-medium leading-relaxed">
                <p>
                  Synapse Eduhub was never intended to be a 'normal' coaching
                  center. While we are still growing and evolving, our mission
                  is clear: to build a focused learning ecosystem that moves
                  away from the noise of mass-crowded classrooms.
                </p>
                <p>
                  We believe that because every student is different, they must
                  be treated differently. Our model isn’t about coaching a
                  crowd; it’s about curating small, compact batches where
                  personal attention isn't just a promise—it’s the foundation.
                  By incorporating every possible amenity into our Focus
                  Learning Model, we are creating a space dedicated to Nurturing
                  Potential and helping every individual unleash their maximum
                  strength. We are still building, still growing, and always
                  Navigating the Future together.
                </p>
                <p className="text-slate-500 italic">— Amith Girish</p>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 min-w-[120px]">
                  <span className="text-3xl font-black text-cyan-600">
                    100+
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Students
                  </span>
                </div>
                <div className="flex flex-col items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 min-w-[120px]">
                  <span className="text-3xl font-black text-indigo-600">
                    5+
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Languages
                  </span>
                </div>
                <div className="flex flex-col items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 min-w-[120px]">
                  <span className="text-3xl font-black text-emerald-600">
                    100%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Pass Rate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <img
            src={logo}
            alt=""
            className="absolute -top-20 -right-20 w-96 h-96 grayscale"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Our Core Values
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-medium">
              The principles that guide our educational journey and ensure
              student success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, i) => (
              <div
                key={i}
                className="group p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <val.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline / Journey */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-start gap-12 lg:gap-20">
            <div className="md:w-1/3 space-y-6 md:sticky md:top-32">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Our <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                  Journey
                </span>
              </h2>
              <p className="text-slate-600 font-medium">
                From a small room to India's most focused learning ecosystem,
                here is how we grew.
              </p>
              <div className="p-1 px-3 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] inline-block border border-orange-100">
                Growth Timeline
              </div>
            </div>
            <div className="md:w-2/3 space-y-12">
              {milestones.map((ms, i) => (
                <div
                  key={i}
                  className="relative pl-12 border-l-2 border-slate-100"
                >
                  <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-white border-4 border-orange-500 shadow-lg shadow-orange-500/20" />
                  <div className="space-y-2">
                    <span className="text-2xl font-black text-orange-500/20">
                      {ms.year}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {ms.title}
                    </h3>
                    <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                      {ms.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-br from-cyan-900 via-cyan-800 to-sky-700 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <img
                src={logo}
                alt=""
                className="absolute -bottom-20 -left-20 w-96 h-96 grayscale"
              />
            </div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Ready to transform your <br /> educational journey?
              </h2>
              <p className="text-cyan-100 text-lg font-medium max-w-2xl mx-auto">
                Join thousands of successful students and start learning with
                India's most dedicated regional language mentors today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="group w-full sm:w-auto px-10 py-5 bg-white text-cyan-900 rounded-2xl font-black text-lg shadow-xl hover:shadow-white/20 hover:scale-105 transition-all flex items-center justify-center gap-3">
                  Enrol Now
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto px-10 py-5 bg-cyan-950/30 text-white border border-cyan-400/30 rounded-2xl font-black text-lg hover:bg-cyan-900/50 backdrop-blur-sm transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
