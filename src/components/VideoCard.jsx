import React, { useState } from "react";
import shortThumbnail from "../assets/shorts_thumbnail.png";
import QuestionPaperCard from "./QuestionPaperCard";

const VideoCard = () => {
  const [showShort, setShowShort] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-slate-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                Featured Content
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight">
              Welcome to
              <br />
              <span className="text-cyan-600">Synapse Edu Hub</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover cutting-edge education through immersive videos and
              innovative learning experiences
            </p>
          </div>

          {/* Video Section */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Main Video - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="group relative bg-white/60 backdrop-blur-sm rounded-3xl p-2 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30">
                <div className="relative overflow-hidden rounded-2xl">
                  <iframe
                    src="https://www.youtube.com/embed/VvJBr0Fuklg?si=r3-NtHZqthj4QOdb"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full aspect-video rounded-2xl"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        About Our Mission
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>Main Feature</span>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>5 min watch</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Dive deep into our innovative approach to education and
                    discover how we're transforming learning through technology,
                    creativity, and student-centered experiences.
                  </p>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 text-cyan-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="font-semibold">Featured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube Short - Takes 1 column */}
            <div className="flex justify-center">
              <div
                className="group relative bg-white/60 backdrop-blur-sm rounded-3xl p-2 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer border border-white/30 hover:scale-105 transform"
                onClick={() => setShowShort(true)}
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={shortThumbnail}
                    alt="YouTube Shorts"
                    className="w-full aspect-[9/16] object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-2xl">
                      <svg
                        className="w-8 h-8 text-gray-800 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Shorts Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      SHORTS
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                      0:30
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-bold text-gray-800 text-lg mb-2">
                    Quick Introduction
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Get a glimpse of what makes Synapse special in just 30
                    seconds
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span>Tap to watch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

           <QuestionPaperCard />

          {/* Stats Section */}
       
        </div>
      </div>

      {/* Enhanced Modal for Shorts */}
      {showShort && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-sm animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowShort(false)}
              className="absolute -top-16 right-0 text-white hover:text-gray-300 transition-all duration-200 bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <iframe
                src="https://www.youtube.com/embed/-TaOmXBtYhk"
                title="YouTube Shorts player"
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