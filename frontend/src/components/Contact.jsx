import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Linkedin, MessageCircle, Globe } from "lucide-react";

const Contact = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("https://formspree.io/f/xovnoadv", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
        setTimeout(() => setStatus(""), 4000);
      } else {
        const data = await response.json();
        setStatus(data.errors ? data.errors.map((err) => err.message).join(", ") : "error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 py-24 bg-[#0f172a] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dynamic Aurora Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Details Column */}
          <div className="w-full lg:w-[40%] space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Connect With Us</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] font-['Outfit']">
                Let's Start a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Conversation</span>
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                Have questions about our programs or need personalized guidance? Our team is here to help you navigate your educational journey.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Phone, label: "Call Us", value: "+91 81579 30567", link: "tel:+918157930567", color: "text-emerald-400" },
                { icon: Mail, label: "Email Us", value: "info@synapseedu.in", link: "mailto:info@synapseedu.in", color: "text-blue-400" },
                { icon: MapPin, label: "Visit Us", value: "Synapse Edu Hub, Kerala, India", link: "#", color: "text-rose-400" }
              ].map((item, i) => (
                <a key={i} href={item.link} className="group flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-bold text-white tracking-tight">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social Links Hub */}
            <div className="pt-8">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Digital Ecosystem</p>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, link: "https://www.instagram.com/synapse_edu.hub", color: "hover:text-pink-500" },
                  { icon: Facebook, link: "https://www.facebook.com/share/1KBy2iguoK/", color: "hover:text-blue-500" },
                  { icon: Linkedin, link: "https://www.linkedin.com/in/synapse-edu-hub-9b788b371", color: "hover:text-blue-400" },
                  { icon: MessageCircle, link: "https://wa.me/8157930567", color: "hover:text-emerald-500" }
                ].map((social, i) => (
                  <a key={i} href={social.link} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 ${social.color}`}>
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="w-full lg:w-[60%]">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your Identity</label>
                      <input 
                        type="text" name="name" required placeholder="Full Name"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                      <input 
                        type="email" name="email" required placeholder="name@email.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject of interest</label>
                    <input 
                      type="text" name="subject" placeholder="What's on your mind?"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Message Details</label>
                    <textarea 
                      name="message" required rows="5" placeholder="How can we help you reach your goals?"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit" disabled={loading}
                    className="group relative w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 font-black text-white uppercase tracking-[0.2em] text-[11px] overflow-hidden transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? "Transmitting..." : "Send Intelligence"}
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </button>

                  {status && (
                    <div className={`text-center pt-4 text-xs font-bold uppercase tracking-widest ${status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {status === 'success' ? '— Transmission Successful —' : '— Error in Transmission —'}
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

