import React, { useState } from "react";
import { Play, Sparkles, Youtube, Clock, Star, X, Zap } from "lucide-react";
import shortThumbnail from "../assets/shorts_thumbnail.png";
import QuestionPaperCard from "./QuestionPaperCard";

const VideoCard = () => {
  const [activeShortId, setActiveShortId] = useState(null);
  const [inlinePlayingId, setInlinePlayingId] = useState(null);

  const shortsData = [
    {
      id: "JXyYq5SR4Gw",
      title: "Hindi Edition",
      desc: "Comprehensive insights in Hindi for our diverse student base.",
      lang: "Hindi",
      color: "from-orange-500 to-red-600",
      thumbnail: shortThumbnail
    },
    {
      id: "8aMqLAY3iIQ",
      title: "Tamil Edition",
      desc: "Master key concepts with our dedicated Tamil-medium guidance.",
      lang: "Tamil",
      color: "from-blue-600 to-indigo-700",
      thumbnail: shortThumbnail
    },
    {
      id: "-TaOmXBtYhk",
      title: "General Intro",
      desc: "A quick glimpse into the Synapse Hub ecosystem.",
      lang: "Malayalam",
      color: "from-emerald-500 to-teal-600",
      thumbnail: shortThumbnail
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Premium Background Architecture */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-cyan-200/30 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-200/30 blur-[100px] rounded-full animate-pulse [animation-delay:1.5s]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <div className="relative z-10 py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">

          {/* Section Intelligence Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Digital Learning Hub</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.95] font-['Outfit']">
              Immersive <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Intelligence</span>
            </h1>
            <p className="text-slate-500 font-medium text-base max-w-xl mx-auto leading-relaxed">
              Explore our mission and educational methodology through high-fidelity visual narratives across multiple languages.
            </p>
          </div>

          <div className="space-y-16">
            {/* Main Cinema Module - Reduced for Standard Approach */}
            <div className="group max-w-5xl mx-auto w-full">
              <div className="relative bg-white rounded-[2rem] p-2.5 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.06)] border border-slate-100 transition-all duration-500 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.1)]">
                <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-900 aspect-video group-hover:shadow-2xl transition-all duration-700">
                  <iframe
                    src="https://www.youtube.com/embed/VvJBr0Fuklg?si=r3-NtHZqthj4QOdb"
                    title="Synapse Mission"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  />
                  <div className="absolute top-5 left-5 flex gap-2">
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Premier Feature
                    </div>
                  </div>
                </div>

                <div className="p-6 lg:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-cyan-600 mb-0.5">
                      <div className="w-8 h-[2px] bg-cyan-500 rounded-full" />
                      <span className="text-[9px] font-black uppercase tracking-[.3em]">Core Mission</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight font-['Outfit']">
                      Transformative Education
                    </h3>
                    <p className="text-slate-500 font-medium text-xs leading-relaxed max-w-sm">
                      Discover how we're reshaping the future of learning through deep technical insight and student-centric design.
                    </p>
                  </div>

                  <div className="hidden lg:flex items-center gap-5 pr-2">

                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                      <Youtube className="w-4 h-4 text-red-500" />
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Language Ecosystem - Shorts Grid */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight font-['Outfit']">Language Ecosystem</h3>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {shortsData.map((short, i) => (
                  <div
                    key={i}
                    className="group relative bg-white rounded-[2.5rem] p-3 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="relative h-[480px] overflow-hidden rounded-[1.8rem] bg-slate-900 shadow-inner">
                      {inlinePlayingId === short.id ? (
                        <div className="w-full h-full bg-black relative">
                          <iframe
                            src={`https://www.youtube.com/embed/${short.id}?autoplay=1`}
                            title={short.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInlinePlayingId(null);
                            }}
                            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <img
                            src={short.thumbnail}
                            alt={short.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/10" />

                          {/* Language Badge */}
                          <div className="absolute top-6 left-6">
                            <div className={`bg-gradient-to-r ${short.color} text-white px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest shadow-lg uppercase shadow-black/20`}>
                              {short.lang}
                            </div>
                          </div>

                          {/* Play Interface */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                            <button
                              onClick={() => setInlinePlayingId(short.id)}
                              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center scale-90 group-hover:scale-100 transition-all duration-500 shadow-2xl hover:bg-white/20"
                            >
                              <div className="w-11 h-11 rounded-full bg-white text-slate-900 flex items-center justify-center pl-1 shadow-xl">
                                <Play className="w-5 h-5 fill-slate-900" />
                              </div>
                            </button>

                            {/* Expand to Modal Option */}
                            <button
                              onClick={() => setActiveShortId(short.id)}
                              className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white hover:text-slate-900"
                            >
                              Launch Fullscreen
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-6 text-center">
                      <h4 className="text-lg font-black text-slate-800 tracking-tight font-['Outfit'] mb-1">
                        {short.title}
                      </h4>
                      <p className="text-slate-500 text-[12px] font-medium leading-relaxed">
                        {short.desc}
                      </p>
                    </div>

                    {/* Interaction Indicator */}
                    <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity font-black text-[10px] text-cyan-600 uppercase tracking-widest">
                      Learn More →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-32">
            <QuestionPaperCard />
          </div>

        </div>
      </div>

      {/* Modern Shorts Modal Overlay */}
      {activeShortId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-[400px] animate-in slide-in-from-bottom-10 duration-500">
            <button
              onClick={() => setActiveShortId(null)}
              className="absolute -top-14 right-0 w-10 h-10 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${activeShortId}`}
                title="Synapse Insight"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full aspect-[9/16]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default VideoCard;
