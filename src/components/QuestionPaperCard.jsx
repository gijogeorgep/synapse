import React, { useState } from "react";
import q_cloud_synapse from "../assets/q cloud synapse.png";
import q_cloud_synapse2 from "../assets/q cloud synapse 2.png";
import brainmap1 from "../assets/brainmap1.png";
import brainmap2 from "../assets/brainmap2.png";
import brainmap3 from "../assets/brainmap3.png";

const QuestionPaperCard = () => {
  const [paperIndex, setPaperIndex] = useState(0);
  const [brainIndex, setBrainIndex] = useState(0);

  const questionPapers = [q_cloud_synapse, q_cloud_synapse2];
  const brainmaps = [brainmap1, brainmap2, brainmap3];

  const nextPaper = () => setPaperIndex((prev) => (prev + 1) % questionPapers.length);
  const prevPaper = () => setPaperIndex((prev) => (prev - 1 + questionPapers.length) % questionPapers.length);

  const nextBrain = () => setBrainIndex((prev) => (prev + 1) % brainmaps.length);
  const prevBrain = () => setBrainIndex((prev) => (prev - 1 + brainmaps.length) % brainmaps.length);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 space-y-8">

      {/* Container */}
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">

        {/* Question Paper Section */}
        <div className="flex-1 bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-center mb-4">QCloud - Model Question Paper</h2>
          
          <div className="relative w-full flex items-center justify-center">
            <img
              src={questionPapers[paperIndex]}
              alt="Question Paper"
              className="rounded-xl max-h-[60vh] w-full object-contain"
            />
            <button
              onClick={prevPaper}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800/70 text-white px-3 py-2 rounded-full hover:bg-gray-900 transition"
            >‹</button>
            <button
              onClick={nextPaper}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800/70 text-white px-3 py-2 rounded-full hover:bg-gray-900 transition"
            >›</button>
          </div>

          {/* Slide Indicator */}
          <div className="mt-2 text-gray-700 font-medium">
            {paperIndex + 1} / {questionPapers.length}
          </div>
        </div>

        {/* Brain Mapping Carousel */}
        <div className="flex-1 bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-center mb-4">Brain Mapping Images</h2>

          <div className="relative w-full flex items-center justify-center">
            <img
              src={brainmaps[brainIndex]}
              alt={`Brainmap ${brainIndex + 1}`}
              className="rounded-xl max-h-[60vh] w-full object-cover"
            />
            <button
              onClick={prevBrain}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800/70 text-white px-3 py-2 rounded-full hover:bg-gray-900 transition"
            >‹</button>
            <button
              onClick={nextBrain}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800/70 text-white px-3 py-2 rounded-full hover:bg-gray-900 transition"
            >›</button>
          </div>

          {/* Slide Indicator */}
          <div className="mt-2 text-gray-700 font-medium">
            {brainIndex + 1} / {brainmaps.length}
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuestionPaperCard;
