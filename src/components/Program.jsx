import React from "react";
import primeone from "../assets/primeone.png";
import cluster from "../assets/cluster.png";
import planb from "../assets/planb.png";
import deeprrot from "../assets/deep root.png";
const Program = () => {
  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-cyan-100 to-cyan-50 overflow-hidden">
      {/* Section Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-800 mb-12 drop-shadow-md text-center">
        OUR PROGRAMS
      </h1>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-7xl">
        {/* Card 1 */}
        <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition duration-300">
          <div className="relative group">
            <img
              className="w-full h-60 object-cover object-[50%_49%] transform group-hover:scale-105 transition duration-500"
              src={primeone}
              alt="Individual Tuition"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent" />
            <div className="absolute bottom-4 left-6 text-white text-2xl font-bold drop-shadow-lg">
              PRIME ONE
              <p className="font-normal text-xl">
                Personalized Learning, Maximum Focus
              </p>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-cyan-700 text-lg font-semibold mb-2">
              Individual Tuition Program
            </h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed font-medium">
              Comprehensive academic support for students in classes 4-10
              CBSE/STATE boards
            </p>
            <ul className="text-cyan-700 text-base font-medium space-y-2 list-disc list-inside">
              <li> Personalized Attention</li>
              <li>Customized learning </li>
              <li>Direct Doubt Clearing</li>
              <li>Flexible Scheduling</li>
              <li>Focused Exam Preparation</li>
              <li>Progress Tracking</li>
            </ul>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition duration-300">
          <div className="relative group">
            <img
              className="w-full h-60 object-cover object-[50%_30%] transform group-hover:scale-105 transition duration-500"
              // src="https://cdn.firstcry.com/education/2022/06/21192051/Essay-On-My-Classroom-10-Lines-Short-and-Long-Essay-For-Class-1-2-and-3-Kids.jpg"
              img
              src={planb}
              alt="Revision Program"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent" />
            <div className="absolute bottom-4 left-6 text-white text-2xl font-bold drop-shadow-lg">
              PLAN B
              <p className="font-normal text-xl">
                WE plan smartly for YOUR stress-free revison
              </p>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-cyan-700 text-lg font-semibold mb-2">
              Exclusive Revision Program
            </h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Intensive revision and exam preparation for Class 10+ CBSE
              students
            </p>
            <ul className="text-cyan-700 text-base font-medium space-y-2 list-disc list-inside">
              <li>Structured Revision</li>
              <li>Exam-Oriented Approach</li>
              <li> Concept Reinforcement</li>
              <li>Time Management Strategies</li>
              <li>Doubt Clearance Sessions</li>
              <li>Frequent Evaluation</li>
            </ul>
          </div>
        </div>

        {/* Card 3  */}
        <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition duration-300">
          <div className="relative group">
            <img
              className="w-full h-60 object-cover object-[50%_28%] transform group-hover:scale-105 transition duration-500"
              src={cluster}
              // src="https://media.istockphoto.com/id/1029717906/photo/girl-doing-homework-at-home-stock-image.jpg?s=612x612&w=0&k=20&c=Hiye1OCQJpI37TCmUUqCm3KznJpwReAOPNWmvtnCMZ4="
              alt="Revision Program"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent" />
            <div className="absolute bottom-4 left-6 text-white text-2xl font-bold drop-shadow-lg">
              CLUSTER
              <p className="font-normal text-xl">Together Towards Success</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Intensive revision and exam preparation for Class 10+ CBSE
              students
            </p>
            <ul className="text-cyan-700 text-base font-medium space-y-2 list-disc list-inside">
              <li>Compact Batches</li>
              <li>Peer Learning</li>
              <li>Balanced Attention</li>
              <li> Interactive Sessions</li>
              <li> Focused Curriculum</li>
              <li> Frequent Evaluation</li>
            </ul>
          </div>
        </div>

        <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition duration-300">
          <div className="relative group">
            <img
              className="w-full h-60 object-cover object-[50%_38%] transform group-hover:scale-105 transition duration-500"
              img
              src={deeprrot}
              // src="https://media.istockphoto.com/id/1899836013/photo/rear-view-of-a-girl-student-raising-her-hand-to-ask-on-classroom-at-school.jpg?s=612x612&w=0&k=20&c=cFzBJCWeXWxrHUC47Ju7Z5-4jsfqegTrbgXqI9hSfVs="
              alt="Revision Program"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent" />
            <div className="absolute bottom-4 left-6 text-white text-2xl font-bold drop-shadow-lg">
              DEEP ROOTS
              <p className="font-normal text-xl">Together Towards Success</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Intensive Bridge Course forstudents
            </p>
            <ul className="text-cyan-700 text-base font-medium space-y-2 list-disc list-inside">
              <li> Strengthens fundamentals in Maths, Science, and Social</li>
              <li>Bridges learning gaps before entering the next class</li>
              <li>Small, focused batches for personal attention</li>
              <li> Regular revision sessions for long-term retention</li>
              <li>Dedicated doubt clearance to build confidence</li>
              <li>Smooth academic transition with stronger basics</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Program;
