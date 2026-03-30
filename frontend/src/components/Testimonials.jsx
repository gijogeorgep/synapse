import { useRef } from "react";
import { Quote, Star, Sparkles } from "lucide-react";
import useGsapReveal from "../hooks/useGsapReveal";

const facultyReviews = [
  {
    name: "Akhil Raj",
    role: "Physics Faculty",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    review:
      "Synapse gives us a structured way to mentor students closely. The platform makes lesson planning, follow-up, and performance tracking feel much more connected.",
  },
  {
    name: "Nimisha Paul",
    role: "Academic Mentor",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    review:
      "What stands out is the personal attention students receive. The learning flow is organized, and the communication between faculty and learners stays very clear.",
  },
];

const studentReviews = [
  {
    name: "Fathima Sherin",
    role: "NEET Student",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    review:
      "The classes feel focused and motivating. I can revise properly, practice often, and get guidance whenever I feel stuck.",
  },
  {
    name: "Adarsh Krishna",
    role: "Plus One Student",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    review:
      "The teachers explain concepts in a simple way and the study support is very consistent. It helped me feel more confident about exams.",
  },
  {
    name: "Ananya S",
    role: "Foundation Program Student",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    review:
      "I like how everything feels planned out. The sessions, doubt clearing, and tests together made my preparation much stronger.",
  },
];

const ReviewCard = ({ item, accent, featured = false, delay = 0 }) => (
  <article
    data-gsap="reveal"
    data-y="28"
    data-scale="0.98"
    data-delay={String(delay / 1000)}
    className={`group relative overflow-hidden rounded-[1.75rem] border border-white/45 bg-white/28 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-700 ease-out hover:-translate-y-1 hover:border-cyan-200/60 hover:bg-white/36 hover:shadow-[0_24px_50px_rgba(14,116,144,0.14)] ${featured ? "md:p-7" : ""}`}
  >
    <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(255,255,255,0.14)_45%,rgba(14,165,233,0.08)_100%)] opacity-90" />
    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/80" />
    <div className="relative z-10">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white/80 bg-white/40 shadow-[0_12px_24px_rgba(15,23,42,0.12)] ring-4 ring-cyan-100/60">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-slate-900">{item.name}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-600">
              {item.role}
            </p>
            <div className="mt-2 flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={`${item.name}-${index}`} className="h-4 w-4 fill-current" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/35 bg-white/20 text-slate-700">
          <Quote className="h-4 w-4" />
        </div>
      </div>
      <p className={`text-slate-600 ${featured ? "text-base leading-8" : "text-sm leading-7"}`}>
        "{item.review}"
      </p>
    </div>
  </article>
);

const Testimonials = () => {
  const sectionRef = useGsapReveal();

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_42%,#f8fafc_100%)] px-6 py-24 md:px-10">
      <div className="absolute inset-0">
        <div className="absolute left-[-8%] top-16 h-56 w-56 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute bottom-10 right-[-6%] h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(14,165,233,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div data-gsap="reveal" data-y="34" className="lg:sticky lg:top-32">
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/50 bg-white/42 p-7 shadow-[0_22px_70px_rgba(15,23,42,0.09)] backdrop-blur-2xl md:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(255,255,255,0.18)_48%,rgba(14,165,233,0.08)_100%)]" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/70 bg-white/60 px-4 py-1.5 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-700">
                    Voices of Synapse
                  </span>
                </div>
                <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
                  Proof, Trust, and Real Learning Stories
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
                  This area works best before FAQ and contact because it gives visitors confidence right before they decide to ask questions or reach out.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-[1.4rem] border border-white/45 bg-white/28 p-4 backdrop-blur-xl">
                    <p className="text-3xl font-black tracking-tight text-slate-900">4.9/5</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Learning Experience
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/45 bg-white/28 p-4 backdrop-blur-xl">
                    <p className="text-3xl font-black tracking-tight text-slate-900">100%</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Mentor Support
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                  Student Reviews
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
              </div>
              <ReviewCard item={studentReviews[0]} accent="from-cyan-500 via-sky-500 to-blue-500" featured delay={120} />
            </div>

            <ReviewCard item={studentReviews[1]} accent="from-sky-500 via-cyan-500 to-blue-500" delay={220} />
            <ReviewCard item={studentReviews[2]} accent="from-cyan-500 via-teal-500 to-sky-500" delay={320} />

            <div className="md:col-span-2 pt-2">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                  Faculty Reviews
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              </div>
            </div>

            <ReviewCard item={facultyReviews[0]} accent="from-slate-900 via-cyan-700 to-cyan-500" delay={420} />
            <ReviewCard item={facultyReviews[1]} accent="from-cyan-700 via-slate-700 to-slate-900" delay={520} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
