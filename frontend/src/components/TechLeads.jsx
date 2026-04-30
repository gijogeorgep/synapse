import React from "react";
import { Users, GraduationCap, Star, Zap } from "lucide-react";
import gijo from "../assets/gijo.jpeg";
import ashin from "../assets/ashin.jpeg";
import jinson from "../assets/jinson.jpeg";

const TechLeads = () => {
  const leads = [
    {
      name: "Gijo George",
      role: "Tech Lead",
      image: gijo,
    },
    {
      name: "Ashin Girish",
      role: "Operations Lead",
      image: ashin,
    },
    {
      name: "Jinson Dcruz",
      role: "Marketing Lead",
      image: jinson,
    },
  ];

  const features = [
    {
      icon: Users,
      title: "Personalized Path",
      desc: "Learning tailored to your speed",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: GraduationCap,
      title: "Expert Educators",
      desc: "Passionate regional faculties",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: Star,
      title: "Excellence Driven",
      desc: "Focused on academic mastery",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Zap,
      title: "Modern Tools",
      desc: "Innovative learning methodologies",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="flex-1 w-full relative">
      {/* Decorative Gradient Blob */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-100/30 blur-[100px] rounded-full" />

      <div className="text-center mb-10 relative z-10">
        <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter font-['Outfit']">
          Meet the <span className="text-cyan-600">LEADS</span>
        </h2>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        {leads.map((lead, index) => (
          <div key={index} className="flex flex-col items-center group cursor-pointer">
            <div className={`relative w-full max-w-[220px] aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 bg-slate-200 transition-all duration-500 group-hover:scale-[1.05] group-hover:shadow-xl shadow-md`}>
              <img
                src={lead.image}
                alt={lead.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">
                {lead.name}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-cyan-600 transition-colors">
                {lead.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-5 p-6 bg-white/80 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${feature.color} group-hover:scale-110 transition-transform shadow-sm`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-800 tracking-tight">
                {feature.title}
              </h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechLeads;
