import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`group border-b border-slate-200/60 last:border-0 transition-all duration-300 ${isOpen ? 'bg-white/50' : 'hover:bg-slate-50/50'}`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 px-4 md:px-8 text-left focus:outline-none"
      >
        <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${isOpen ? 'text-cyan-700' : 'text-slate-800 group-hover:text-cyan-600'}`}>
          {question}
        </span>
        <div className={`flex-shrink-0 ml-4 transition-transform duration-500 rounded-full p-2 ${isOpen ? 'rotate-180 bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-500'}`}>
          <ChevronDown size={20} />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-4 md:px-8 pb-4">
          <p className="text-slate-600 leading-relaxed font-medium">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What programs does Synapse Edu Hub offer?",
      answer: "We offer specialized programs including PRIME ONE (Personalized 1-on-1 Tuition), CLUSTER (Batch Intensive sessions), PLAN B (Focused Revision Program), and DEEP ROOTS (Comprehensive Bridge Course) tailored for different academic levels."
    },
    {
      question: "How can I enroll in a course?",
      answer: "Enrolling is easy! You can fill out the contact form below with your details, call our support team at +91 81579 30567."
    },
    {
      question: "Are the classes conducted online or offline?",
      answer: "We offer maximum flexibility with both interactive online classes and offline sessions. Our offline classes are conducted at the Synapse Mavoor Hub (in collaboration with Crescent Study Centre), providing a premium, focused learning environment for our students."
    },
    {
      question: "Do you provide study materials and notes?",
      answer: "Yes, every enrolled student receives expertly curated study materials, comprehensive question banks, and simplified revision notes designed by our academic experts."
    },
    {
      question: "Can I get a demo session before joining?",
      answer: "Absolutely! We believe in transparency and offer demo sessions for our major programs so you can experience our unique teaching methodology before making a commitment."
    }
  ];

  return (
    <div className="w-full py-24 bg-slate-50/50 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 border border-cyan-200">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.2em]">Got Questions?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter font-['Outfit']">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Questions</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Everything you need to know about our programs, methodology, and how we help you achieve academic excellence.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        <div className="mt-12 p-8 rounded-[2rem] bg-gradient-to-br from-cyan-600 to-indigo-700 text-white text-center shadow-xl shadow-cyan-900/10">
          <p className="font-bold mb-2">Still have more questions?</p>
          <p className="text-cyan-50 opacity-80 text-sm mb-6">Our academic counselors are ready to help you navigate your journey.</p>
          <a
            href="#contact"
            className="inline-flex items-center px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-50 transition-colors"
          >
            Reach Out Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
