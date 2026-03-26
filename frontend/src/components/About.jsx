import React from "react";
import synapse_y_logo from "../assets/synapse y logo.png"; // background logo
import amith from "../assets/amith.jpeg"; // founder photo
import { Facebook, Phone, Instagram, Send, Star, Users, GraduationCap, Quote, Zap } from "lucide-react";

const About = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 py-24 bg-[#f8fafc] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden">
      {/* Premium Background Architecture */}
      <div className="absolute inset-0 z-0">
        {/* The requested background logo */}
        <img
          src={synapse_y_logo}
          alt="Synapse Backdrop"
          className="absolute inset-0 m-auto w-full h-full max-w-[80%] max-h-[80%] opacity-[0.03] object-contain select-none pointer-events-none grayscale"
        />

        {/* Dynamic Light Orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-400/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">

        {/* Founder Portrait Section - Optimized Standard Approach */}
        <div className="flex-1 w-full max-w-[340px] lg:max-w-[360px]">
          <div className="relative group p-4 lg:p-0">
            {/* Elegant Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-100 to-blue-50/50 rounded-[2rem] blur-2xl opacity-50 transition-opacity duration-500" />

            <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)]">

              {/* Image Container - Compact & Balanced */}
              <div className="relative h-[280px] overflow-hidden">
                <img
                  src={amith}
                  alt="Amith Girish"
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-70" />


              </div>

              {/* Content Area - Tight & Structured */}
              <div className="p-6 pb-8 flex-1 flex flex-col items-center">
                <div className="text-center mb-5">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter leading-none mb-1 font-['Outfit']">
                    Amith Girish
                  </h3>
                  <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em]">
                    Founder & CEO
                  </p>
                </div>

                <div className="relative px-5 py-4 bg-slate-50 rounded-xl border border-slate-100/50 mb-6 w-full group-hover:bg-cyan-50/30 transition-colors duration-500">
                  <Quote className="absolute -top-2 -left-1 w-5 h-5 text-cyan-200 fill-cyan-50/50" />
                  <p className="text-slate-600 text-[13px] font-bold italic leading-snug text-center">
                    "Empowering minds through innovative education solutions."
                  </p>
                </div>

                {/* Social Links - Compact Row */}
                <div className="flex gap-2">
                  {[
                    { icon: Facebook, color: "text-blue-600", bg: "hover:bg-blue-600", link: "https://www.facebook.com/share/18RBjNLHAa/" },
                    { icon: Instagram, color: "text-pink-600", bg: "hover:bg-pink-600", link: "https://www.instagram.com/amithgirish_?igsh=eW90NTJxeGJ6Mmto" },
                    { icon: Phone, color: "text-emerald-600", bg: "hover:bg-emerald-600", link: "tel:+9162357 23263" },
                    { icon: Send, color: "text-cyan-600", bg: "hover:bg-cyan-600", link: "https://wa.me/916235723263" }
                  ].map((social, i) => (
                    <a
                      key={i}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 shadow-sm transition-all duration-300 group/soc hover:-translate-y-1 hover:border-transparent hover:text-white ${social.bg}`}
                    >
                      <social.icon className="w-4 h-4 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Decorative Accent */}
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Narrative & Highlights Section */}
        <div className="flex-1 space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-50 border border-cyan-100/50">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Global Educational Vision</span>
            </div>

            <h2 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] font-['Outfit']">
              SYNAPSE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Speaks You</span>
            </h2>

            <div className="space-y-6 text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
              <p>
                At <span className="text-slate-900 font-bold">Synapse Edu Hub</span>, we believe learning is most effective when it speaks your way. We bridge the gap between complexity and clarity.
              </p>
              <p className="text-base text-slate-500">
                We connect students with expert faculty who teach in their regional language — Malayalam, Hindi, Tamil, Telugu, or English. Education isn't just about subjects; it's about understanding you.
              </p>
            </div>
          </div>

          {/* Quick Value Cards (Compact) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Users, title: "Personalized Path", desc: "Learning tailored to your speed", color: "bg-blue-50 text-blue-600" },
              { icon: GraduationCap, title: "Expert Educators", desc: "Passionate regional faculties", color: "bg-indigo-50 text-indigo-600" },
              { icon: Star, title: "Excellence Driven", desc: "Focused on academic mastery", color: "bg-emerald-50 text-emerald-600" },
              { icon: Zap, title: "Modern Tools", desc: "Innovative learning methodologies", color: "bg-amber-50 text-amber-600" }
            ].map((item, i) => (
              <div key={i} className="group p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-cyan-100 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 tracking-tight">{item.title}</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Branding Mark */}
          <div className="flex items-center gap-4 pt-6 opacity-30">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[.4em]">Synapse Hub</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

