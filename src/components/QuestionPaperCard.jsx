import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Brain, FileText } from "lucide-react";
import q_cloud_synapse from "../assets/q cloud synapse.png"; // Replace with actual image paths
import q_cloud_synapse2 from "../assets/q cloud synapse 2.png"; // Replace with actual image paths
import brainmap1 from "../assets/brainmap1.png"; // Replace with actual image paths
import brainmap2 from "../assets/brainmap2.png";
import brainmap3 from "../assets/brainmap3.png";
const QuestionPaperCard = () => {
  const [paperIndex, setPaperIndex] = useState(0);
  const [brainIndex, setBrainIndex] = useState(0);
  const [isLoading, setIsLoading] = useState({ paper: false, brain: false });

  // Placeholder images - replace with your actual image imports
  const questionPapers = [q_cloud_synapse, q_cloud_synapse2];

  const brainmaps = [brainmap1, brainmap2, brainmap3];

  const nextPaper = () => {
    setIsLoading((prev) => ({ ...prev, paper: true }));
    setTimeout(() => {
      setPaperIndex((prev) => (prev + 1) % questionPapers.length);
      setIsLoading((prev) => ({ ...prev, paper: false }));
    }, 200);
  };

  const prevPaper = () => {
    setIsLoading((prev) => ({ ...prev, paper: true }));
    setTimeout(() => {
      setPaperIndex(
        (prev) => (prev - 1 + questionPapers.length) % questionPapers.length
      );
      setIsLoading((prev) => ({ ...prev, paper: false }));
    }, 200);
  };

  const nextBrain = () => {
    setIsLoading((prev) => ({ ...prev, brain: true }));
    setTimeout(() => {
      setBrainIndex((prev) => (prev + 1) % brainmaps.length);
      setIsLoading((prev) => ({ ...prev, brain: false }));
    }, 200);
  };

  const prevBrain = () => {
    setIsLoading((prev) => ({ ...prev, brain: true }));
    setTimeout(() => {
      setBrainIndex((prev) => (prev - 1 + brainmaps.length) % brainmaps.length);
      setIsLoading((prev) => ({ ...prev, brain: false }));
    }, 200);
  };

  return (
    <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Q Cloud Research Portal
        </h1>
        <p className="text-gray-600 text-lg">
          Explore question papers and brain mapping visualizations
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Question Paper Section */}
          <div className="group">
            <div className=" backdrop-blur-sm shadow-2xl rounded-3xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-500 hover:transform hover:scale-[1.02]">
              {/* Section Header */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Model Question Papers
                  </h2>
                </div>
              </div>

              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl  shadow-inner">
                <div
                  className={`transition-all duration-300 ${
                    isLoading.paper ? "opacity-50 blur-sm" : "opacity-100"
                  }`}
                >
                  <img
                    src={questionPapers[paperIndex]}
                    alt={`Question Paper ${paperIndex + 1}`}
                    className="w-full h-[40vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh] xl:h-[70vh] object-contain bg-white rounded-2xl shadow-lg"
                  />
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={prevPaper}
                  disabled={isLoading.paper}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group-hover:opacity-100 opacity-70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPaper}
                  disabled={isLoading.paper}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group-hover:opacity-100 opacity-70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Loading Spinner */}
                {isLoading.paper && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex space-x-1">
                  {questionPapers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setPaperIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === paperIndex
                          ? "bg-blue-600 w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">
                    {paperIndex + 1} of {questionPapers.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Brain Mapping Section */}
          <div className="group">
            <div className="backdrop-blur-sm shadow-2xl rounded-3xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-500 hover:transform hover:scale-[1.02]">
              {/* Section Header */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Brain Mapping Visualizations
                  </h2>
                </div>
              </div>

              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-inner">
                <div
                  className={`transition-all duration-300 ${
                    isLoading.brain ? "opacity-50 blur-sm" : "opacity-100"
                  }`}
                >
                  <img
                    src={brainmaps[brainIndex]}
                    alt={`Brain Map ${brainIndex + 1}`}
                    className="w-full h-[40vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh] xl:h-[70vh] object-contain rounded-2xl shadow-lg bg-white"
                  />
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={prevBrain}
                  disabled={isLoading.brain}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group-hover:opacity-100 opacity-70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextBrain}
                  disabled={isLoading.brain}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group-hover:opacity-100 opacity-70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Loading Spinner */}
                {isLoading.brain && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex space-x-1">
                  {brainmaps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setBrainIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === brainIndex
                          ? "bg-purple-600 w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">
                    {brainIndex + 1} of {brainmaps.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperCard;
