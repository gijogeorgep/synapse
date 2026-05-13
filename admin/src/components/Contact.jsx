import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Linkedin, MessageCircle } from "lucide-react";
import { submitContactForm } from "../api/services";
import useGsapReveal from "../hooks/useGsapReveal";

const Contact = () => {
  const scopeRef = useGsapReveal();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoading(true);
    setStatus("");

    try {
      const formData = new FormData(form);
      await submitContactForm({
        name: formData.get("name"),
        email: formData.get("email"),
        program: formData.get("program"),
        message: formData.get("message"),
      });

      setStatus("success");
      form.reset();
      setTimeout(() => setStatus(""), 4000);
    } catch (error) {
      console.error(error);
      setStatus(error || "error");
    }
    setLoading(false);
  };

  return (
    <section ref={scopeRef} className="relative w-full min-h-screen flex items-center justify-center px-6 py-24 bg-slate-50 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dynamic Aurora Background (Light Version) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-400/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">

          {/* Details Column */}
          <div data-gsap="reveal" data-x="-36" data-y="0" className="w-full lg:w-[40%] flex flex-col justify-center space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 border border-cyan-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Connect With Us</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] font-['Outfit']">
                Let's Start a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Conversation</span>
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                Have questions about our programs or need personalized guidance? Our team is here to help you navigate your educational journey.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Phone, label: "Call Us", value: "+91 81579 30567", link: "tel:+918157930567", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: Mail, label: "Email Us", value: "synapseeduhub@gmail.com", link: "mailto:info@synapseedu.in", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: MapPin, label: "Visit Us", value: "Kozhikode, Kerala, India", link: "#", color: "text-rose-600", bg: "bg-rose-50" }
              ].map((item, i) => (
                <a key={i} href={item.link} className="group flex items-center gap-5 p-4 rounded-[2rem] bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${item.bg} ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold text-slate-700 tracking-tight">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social Links Hub */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Digital Ecosystem</p>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, link: "https://www.instagram.com/synapse_edu.hub", color: "hover:bg-pink-500" },
                  { icon: Facebook, link: "https://www.facebook.com/share/1KBy2iguoK/", color: "hover:bg-blue-600" },
                  { icon: Linkedin, link: "https://www.linkedin.com/in/synapse-edu-hub-9b788b371", color: "hover:bg-blue-700" },
                  { icon: MessageCircle, link: "https://wa.me/8157930567", color: "hover:bg-emerald-500" }
                ].map((social, i) => (
                  <a key={i} href={social.link} target="_blank" rel="noopener noreferrer" className={`w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:text-white hover:border-transparent ${social.color}`}>
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div data-gsap="reveal" data-x="36" data-y="0" data-delay="0.12" className="w-full lg:w-[60%] flex flex-col justify-center">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white border border-slate-200/60 p-8 lg:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                <form onSubmit={handleSubmit} className="space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your Identity</label>
                      <input
                        type="text" name="name" required placeholder="Full Name"
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                      <input
                        type="email" name="email" required placeholder="name@email.com"
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Program of interest</label>
                    <select
                      name="program"
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4.5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="">Select a Program</option>
                      <option value="prime-one">PRIME ONE (1-on-1 Tuition)</option>
                      <option value="cluster">CLUSTER (Batch Intensive)</option>
                      <option value="plan-b">PLAN B (Revision Program)</option>
                      <option value="deep-roots">DEEP ROOTS (Bridge Course)</option>
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Message Details</label>
                    <textarea
                      name="message" required rows="4" placeholder="How can we help you reach your academic goals?"
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all resize-none font-medium"
                    />
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="group relative w-full py-5 rounded-2xl bg-slate-900 font-extrabold text-white uppercase tracking-[0.25em] text-[10px] overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? "Transmitting..." : "Send Intelligence"}
                      <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </button>

                  {status && (
                    <div className={`text-center pt-2 text-[10px] font-black uppercase tracking-[0.3em] ${status === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {status === 'success' ? '— Transmission Received —' : `— ${String(status).toUpperCase()} —`}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

