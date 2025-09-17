import React from "react";

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
              className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-500"
              src="https://www.the74million.org/wp-content/uploads/2024/01/tutor-one-on-one.jpg"
              alt="Individual Tuition"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent" />
            <div className="absolute bottom-4 left-6 text-white text-2xl font-bold drop-shadow-lg">
              PRIME ONE
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-cyan-700 text-lg font-semibold mb-2">
              Individual Tuition Program
            </h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Comprehensive academic support for students in classes 4-10
              CBSE/STATE boards
            </p>
            <ul className="text-cyan-700 text-base font-medium space-y-2 list-disc list-inside">
              <li>One-on-one personalized attention</li>
              <li>Customized learning plans</li>
              <li>Regular progress assessments</li>
              <li>Foundation building focus</li>
            </ul>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition duration-300">
          <div className="relative group">
            <img
              className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-500"
              src="https://cdn.firstcry.com/education/2022/06/21192051/Essay-On-My-Classroom-10-Lines-Short-and-Long-Essay-For-Class-1-2-and-3-Kids.jpg"
              alt="Revision Program"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent" />
            <div className="absolute bottom-4 left-6 text-white text-2xl font-bold drop-shadow-lg">
              PLAN B
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
              <li>Focused exam preparation</li>
              <li>Quick revision techniques</li>
              <li>Mock tests and practice</li>
              <li>Last-minute preparation</li>
            </ul>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition duration-300">
          <div className="relative group">
            <img
              className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-500"
              src="https://media.istockphoto.com/id/1029717906/photo/girl-doing-homework-at-home-stock-image.jpg?s=612x612&w=0&k=20&c=Hiye1OCQJpI37TCmUUqCm3KznJpwReAOPNWmvtnCMZ4="
              alt="Revision Program"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent" />
            <div className="absolute bottom-4 left-6 text-white text-2xl font-bold drop-shadow-lg">
              CLUSTER
            </div>
            <p>Together Towards Success</p>
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
              <li>Focused exam preparation</li>
              <li>Quick revision techniques</li>
              <li>Mock tests and practice</li>
              <li>Last-minute preparation</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Program;
