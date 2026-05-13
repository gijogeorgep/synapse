import React, { useEffect, useState } from "react";
import { BookOpenText, BadgeCheck, GraduationCap, ShieldAlert, ChevronRight } from "lucide-react";

const TermsConditions = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "Acceptance Of Terms",
      body: "By accessing or using the Synapse Edu Hub website, portal, or related services, you agree to be bound by these Terms & Conditions. If you do not agree, you should not use the website or any connected learning services.",
    },
    {
      title: "Services",
      body: "Synapse Edu Hub provides educational information, enquiry support, student onboarding, digital learning access, classroom management, assessments, academic communication, and related platform services. Features may be updated, changed, suspended, or removed at our discretion.",
    },
    {
      title: "Accounts And User Responsibility",
      body: "If you create an account, you are responsible for providing accurate information, keeping your login credentials confidential, and ensuring that activity under your account is authorized. You must notify us promptly if you suspect unauthorized access or misuse.",
    },
    {
      title: "Student, Parent, And Educator Conduct",
      body: "Users must interact respectfully and lawfully while using the platform. You agree not to misuse classrooms, examinations, messages, uploads, study materials, or administrative tools, and not to disrupt the learning experience of students, teachers, staff, or other users.",
    },
    {
      title: "Academic Content And Intellectual Property",
      body: "Unless otherwise stated, course content, study resources, branding, designs, videos, notes, assessments, graphics, and website materials are owned by or licensed to Synapse Edu Hub. You may not copy, sell, redistribute, publish, or exploit platform content beyond permitted educational use without prior written consent.",
    },
    {
      title: "Accuracy And Educational Use",
      body: "We aim to provide useful and high-quality educational content, but we do not guarantee that all content, schedules, results, recommendations, or learning materials will always be complete, error-free, or suitable for every learner. Academic outcomes may vary from student to student.",
    },
    {
      title: "Fees, Payments, And Access",
      body: "If paid programs, admissions, subscriptions, or fee collection are enabled, applicable pricing, payment terms, access duration, and enrollment conditions may be communicated separately. Third-party payment processors may handle transactions. Refunds, cancellations, or rescheduling may be governed by a separate policy where applicable.",
    },
    {
      title: "Suspension Or Termination",
      body: "We may suspend, restrict, or terminate access to the website or portal if we reasonably believe that a user has violated these terms, misused the platform, compromised security, interfered with operations, or engaged in unlawful, abusive, or fraudulent conduct.",
    },
    {
      title: "Third-Party Services",
      body: "Certain features may rely on third-party services such as payment gateways, email providers, cloud storage, messaging tools, or social platforms. We are not responsible for the availability, terms, or privacy practices of those third-party services.",
    },
    {
      title: "Limitation Of Liability",
      body: "To the maximum extent permitted by law, Synapse Edu Hub shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from or related to website use, service interruptions, data loss, account misuse, or reliance on educational content made available through the platform.",
    },
    {
      title: "Changes To The Terms",
      body: "We may revise these Terms & Conditions from time to time to reflect changes in our services, operations, or legal obligations. Continued use of the website or platform after updated terms are published means you accept the revised version.",
    },
    {
      title: "Governing Principles",
      body: "These terms are intended to be interpreted in accordance with applicable laws and regulations relevant to the operation of Synapse Edu Hub. If any provision is found unenforceable, the remaining provisions will continue to apply to the fullest extent possible.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <section className="relative overflow-hidden bg-white pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-6%] h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-8%] h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
          <div
            className={`max-w-4xl space-y-6 transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-amber-700">
              <BookOpenText className="h-4 w-4" />
              Terms & Conditions
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tighter text-slate-900 md:text-7xl">
              Platform rules,
              <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-600 bg-clip-text text-transparent">
                clear from the start
              </span>
            </h1>

            <p className="max-w-3xl text-lg font-medium leading-relaxed text-slate-600 md:text-xl">
              These Terms & Conditions explain the rules for using the Synapse
              Edu Hub website, portal, academic services, classroom tools, and
              related digital learning features.
            </p>

            <div className="grid gap-4 pt-4 md:grid-cols-3">
              <div className="rounded-[2rem] border border-amber-100 bg-white/90 p-5 shadow-sm">
                <BadgeCheck className="mb-3 h-6 w-6 text-amber-600" />
                <p className="text-sm font-bold text-slate-900">Fair Use</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  The platform should be used for lawful, respectful, and
                  education-focused purposes only.
                </p>
              </div>
              <div className="rounded-[2rem] border border-cyan-100 bg-white/90 p-5 shadow-sm">
                <GraduationCap className="mb-3 h-6 w-6 text-cyan-600" />
                <p className="text-sm font-bold text-slate-900">Learning Access</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Enrollment, classroom access, and portal features may depend
                  on account status and program eligibility.
                </p>
              </div>
              <div className="rounded-[2rem] border border-rose-100 bg-white/90 p-5 shadow-sm">
                <ShieldAlert className="mb-3 h-6 w-6 text-rose-600" />
                <p className="text-sm font-bold text-slate-900">Protected Content</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Course content, branding, and materials cannot be copied or
                  reused without permission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.6fr]">
            <aside className="h-fit lg:sticky lg:top-28">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-700">
                  Effective Date
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  March 30, 2026
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">
                  These terms apply to public website visitors, enquiries,
                  registered users, and portal participants.
                </p>

                <div className="mt-6 border-t border-slate-100 pt-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Contact
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>Synapse Edu Hub</p>
                    <p>Email: synapseeduhub@gmail.com</p>
                    <p>Phone: +91 81579 30567</p>
                    <p>Kozhikode, Kerala, India</p>
                  </div>
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                  Summary
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  By using Synapse Edu Hub, you agree to use the website and
                  portal responsibly, respect platform content and account
                  security, and follow any program-specific rules shared during
                  enrollment, classroom participation, assessments, or support
                  interactions.
                </p>
              </div>

              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className="rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-10"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-black text-white shadow-lg shadow-amber-200">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        {section.title}
                      </h2>
                      <p className="mt-4 text-base leading-relaxed text-slate-600">
                        {section.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}

              <article className="rounded-[2.5rem] border border-amber-100 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-7 text-white shadow-xl md:p-10">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                    <ChevronRight className="h-5 w-5 text-amber-200" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">
                      Questions About These Terms
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-100">
                      If you need clarification about platform rules, account
                      usage, educational access, or service terms, you can
                      contact us at{" "}
                      <a
                        href="mailto:synapseeduhub@gmail.com"
                        className="font-bold text-white underline decoration-white/40"
                      >
                        synapseeduhub@gmail.com
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsConditions;
