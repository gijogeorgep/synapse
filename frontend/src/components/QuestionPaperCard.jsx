import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Brain, FileText, Sparkles, ExternalLink, Lock } from "lucide-react";
import q_cloud_synapse from "../assets/q cloud synapse.png";
import q_cloud_synapse2 from "../assets/q cloud synapse 2.png";
import brainmap1 from "../assets/brainmap1.png";
import brainmap2 from "../assets/brainmap2.png";
import brainmap3 from "../assets/brainmap3.png";

const SampleDisplay = ({ title, subTitle, images, category, icon: Icon, colorClass }) => {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative group/section flex flex-col h-full">
      {/* Category Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 rounded-2xl bg-white border border-slate-100 shadow-sm ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight font-['Outfit']">{title}</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{subTitle}</p>
        </div>
      </div>

      {/* Main Display Frame */}
      <div 
        className="relative flex-1 min-h-[500px] rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sample Watermark */}
        <div className="absolute top-6 left-6 z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/20 text-white shadow-xl">
            <Lock size={10} className="text-cyan-400" />
            <span className="text-[9px] font-black uppercase tracking-[.2em]">Sample Copy</span>
          </div>
        </div>

        {/* Image Content */}
        <div className="absolute inset-0 p-8 flex items-center justify-center">
          <img 
            src={images[index]} 
            alt={`${title} Sample`} 
            className="w-full h-full object-contain rounded-xl transition-all duration-700 select-none pointer-events-none"
          />
        </div>

        {/* Slide Controls */}
        <div className="absolute bottom-8 inset-x-8 flex items-center justify-between z-40">
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setIndex(i)}
                className={`h-1.5 transition-all duration-500 rounded-full ${i === index ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200 hover:bg-slate-400'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={prev} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-slate-100 text-slate-800 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-lg">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-slate-100 text-slate-800 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-lg">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionPaperCard = () => {
  const questionPapers = [q_cloud_synapse, q_cloud_synapse2];
  const brainmaps = [brainmap1, brainmap2, brainmap3];

  return (
    <div className="w-full py-12 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Integrated Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-[10px] font-black text-cyan-700 uppercase tracking-[.2em]">Q-Cloud Research Portal</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter font-['Outfit']">
            Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Learning Blueprints</span>
          </h2>
        </div>
        <p className="text-slate-500 font-medium text-sm max-w-sm leading-relaxed">
          Proprietary question papers and brain-mapping insights designed to accelerate academic performance and cognitive clarity.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
        <SampleDisplay 
          title="Academic Papers" 
          subTitle="Structure & Strategy"
          images={questionPapers} 
          category="papers"
          icon={FileText}
          colorClass="text-blue-600 border-blue-100"
        />
        <SampleDisplay 
          title="Brain Mapping" 
          subTitle="Cognitive Landscapes"
          images={brainmaps} 
          category="brain"
          icon={Brain}
          colorClass="text-indigo-600 border-indigo-100"
        />
      </div>

      {/* Trust Indicator Footer */}
      <div className="mt-20 pt-10 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          <div className="flex items-center gap-3 opacity-40">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Verified Content</span>
          </div>
          <div className="flex items-center gap-3 opacity-40">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Expert Curated</span>
          </div>
          <div className="flex items-center gap-3 opacity-40">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Exclusive Portal</span>
          </div>
      </div>
    </div>
  );
};

export default QuestionPaperCard;
