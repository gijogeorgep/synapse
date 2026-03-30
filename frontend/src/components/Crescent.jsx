import React from "react";
import { MapPin, Building2, ExternalLink } from "lucide-react";
import cresent12 from "../assets/cresent12.jpg";
import cresent10 from "../assets/cresent10.jpg";
import cresent9 from "../assets/cresent9.jpg";
import useGsapReveal from "../hooks/useGsapReveal";

const Crescent = () => {
    const scopeRef = useGsapReveal();

    return (
        <section ref={scopeRef} className="w-full bg-slate-50 py-16 px-6 md:px-20 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div data-gsap="reveal" data-y="28" className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                        <Building2 size={12} className="text-cyan-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Offline Presence</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-['Outfit']">
                        Synapse <span className="text-cyan-600">x</span> Crescent
                    </h2>
                    <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                        Experience our transformative education at <span className="text-slate-900 font-bold">Crescent Study Centre, Mavoor</span>. Bringing Synapse's digital intelligence to a dedicated offline learning environment.
                    </p>
                </div>

                {/* No BG, Rounded Edge Image Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[cresent12, cresent10, cresent9].map((img, i) => (
                        <div
                            key={i}
                            data-gsap="reveal"
                            data-y="34"
                            data-delay={String(0.12 + i * 0.08)}
                            className="group overflow-hidden rounded-[2rem] shadow-sm transition-all duration-300 hover:shadow-xl"
                        >
                            <img 
                                src={img} 
                                alt={`Campus view ${i+1}`} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            />
                        </div>
                    ))}
                </div>

                {/* Compact Info & Map */}
                <div className="bg-white rounded-[3rem] border border-slate-200/60 p-8 md:p-12 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-8 items-center">
                    <div data-gsap="reveal" data-x="-36" data-y="0" data-delay="0.3" className="md:w-1/2 space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">The Mavoor Hub</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Our collaborative campus provides a focused environment for academic excellence, featuring direct mentorship and premium materials.
                            </p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0 border border-cyan-100 shadow-sm">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Location</p>
                                <p className="text-sm font-bold text-slate-700">
                                    Mavoor - Calicut Rd, Mavoor, Kerala 673661
                                </p>
                            </div>
                        </div>
                        <a 
                            href="https://maps.app.goo.gl/o1kBy2iguoK" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-cyan-600 transition-all hover:shadow-xl hover:shadow-cyan-900/10"
                        >
                            Get Directions
                            <ExternalLink size={14} />
                        </a>
                    </div>
                    
                    <div data-gsap="reveal" data-x="36" data-y="0" data-delay="0.38" className="md:w-1/2 h-[280px] w-full rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner ring-1 ring-slate-100">
                        <iframe
                            title="Synapse Mavoor Location"
                            src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d148918.48916134008!2d75.86807791418465!3d11.24065434603382!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x3ba645c5d46c52df%3A0xfcce108cd88d162e!2s7X63%2B35J%2C%20Mavoor%20-%20Calicut%20Rd%2C%20Mavoor%2C%20Kerala%20673661!3m2!1d11.2603672!2d75.95287669999999!5e0!3m2!1sen!2sin!4v1758369376986!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Crescent;
