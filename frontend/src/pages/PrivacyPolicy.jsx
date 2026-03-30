import React, { useEffect, useState } from "react";
import { ShieldCheck, Lock, Mail, Phone, ChevronRight } from "lucide-react";

const PrivacyPolicy = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "Information We Collect",
      body: "Synapse Edu Hub may collect personal information that you provide directly to us, including your name, email address, phone number, academic preferences, contact form details, account credentials, profile details, and information you submit while using the student, teacher, or admin portal.",
    },
    {
      title: "How We Use Your Information",
      body: "We use the information we collect to create and manage user accounts, send OTP and account-related communication, respond to enquiries, provide academic support, personalize learning experiences, manage classrooms and assessments, improve our services, maintain platform security, and comply with legal obligations.",
    },
    {
      title: "Portal And Learning Data",
      body: "When you use our platform, we may process information related to your classroom participation, exam activity, uploaded profile images, settings, learning progress, and administrative records required to deliver educational services and support operations.",
    },
    {
      title: "Payments",
      body: "If online payments, admissions, or fee collection are enabled, payment processing may be handled through third-party payment service providers. We do not intend to store full card or banking details on this website unless explicitly stated. Payment partners may process payment-related information according to their own policies and legal requirements.",
    },
    {
      title: "Cookies And Local Storage",
      body: "This website may use browser storage technologies such as localStorage to keep you signed in, remember account state, and support core platform functionality. We may also use technical cookies or similar technologies required for performance, security, and user experience.",
    },
    {
      title: "Sharing Of Information",
      body: "We do not sell personal information. We may share information with service providers and partners who help us operate the platform, such as hosting, email, cloud storage, analytics, media upload, or payment providers, and when required by law, lawful request, or to protect our rights and users.",
    },
    {
      title: "Data Security",
      body: "We use reasonable technical and organizational safeguards to protect personal information from unauthorized access, misuse, alteration, or disclosure. However, no method of internet transmission or electronic storage is completely secure, and absolute security cannot be guaranteed.",
    },
    {
      title: "Data Retention",
      body: "We retain personal information for as long as needed to provide our services, maintain academic and administrative records, resolve disputes, enforce agreements, and comply with applicable legal, regulatory, or operational requirements.",
    },
    {
      title: "Your Choices And Rights",
      body: "You may contact us to request correction or update of your personal information. Where applicable, you may also withdraw consent for certain processing, subject to legal, contractual, and service-related limitations. Some information may remain necessary for account access, academic records, fraud prevention, or legal compliance.",
    },
    {
      title: "Children And Students",
      body: "Because our services are education-focused, student information may be processed for enrolment, instruction, progress tracking, communication, and support. Parents or guardians should supervise account use where required by applicable law or institutional practice.",
    },
    {
      title: "Third-Party Links",
      body: "Our website may contain links to third-party websites or platforms such as social media, messaging services, or payment gateways. We are not responsible for the privacy practices or content of those third-party services.",
    },
    {
      title: "Policy Updates",
      body: "We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements, or business practices. Updated versions will be posted on this page with a revised effective date.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <section className="relative overflow-hidden bg-white pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0">
          <div className="absolute top-[-8%] right-[-8%] h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(#0891b2 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
          <div
            className={`max-w-4xl space-y-6 transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-cyan-700">
              <ShieldCheck className="h-4 w-4" />
              Privacy Policy
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tighter text-slate-900 md:text-7xl">
              Your data,
              <br />
              <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                handled with care
              </span>
            </h1>

            <p className="max-w-3xl text-lg font-medium leading-relaxed text-slate-600 md:text-xl">
              This Privacy Policy explains how Synapse Edu Hub collects, uses,
              stores, and protects information when you use our website,
              contact our team, create an account, or access our learning
              platform.
            </p>

            <div className="grid gap-4 pt-4 md:grid-cols-3">
              <div className="rounded-[2rem] border border-cyan-100 bg-white/90 p-5 shadow-sm">
                <Lock className="mb-3 h-6 w-6 text-cyan-600" />
                <p className="text-sm font-bold text-slate-900">Secure Access</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Account data and session details are used to support secure
                  portal access.
                </p>
              </div>
              <div className="rounded-[2rem] border border-sky-100 bg-white/90 p-5 shadow-sm">
                <Mail className="mb-3 h-6 w-6 text-sky-600" />
                <p className="text-sm font-bold text-slate-900">Clear Communication</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  We use submitted contact details to respond to enquiries and
                  academic support requests.
                </p>
              </div>
              <div className="rounded-[2rem] border border-indigo-100 bg-white/90 p-5 shadow-sm">
                <Phone className="mb-3 h-6 w-6 text-indigo-600" />
                <p className="text-sm font-bold text-slate-900">Support First</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Student and parent communication may be used for enrolment,
                  guidance, and service delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.6fr]">
            <aside className="lg:sticky lg:top-28 h-fit">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-700">
                  Effective Date
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  March 30, 2026
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">
                  This page is written for the current Synapse Edu Hub website
                  and learning platform experience.
                </p>

                <div className="mt-6 border-t border-slate-100 pt-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Contact For Privacy Questions
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>
                      Synapse Edu Hub
                    </p>
                    <p>
                      Email:{" "}
                      <a
                        href="mailto:synapseeduhub@gmail.com"
                        className="font-semibold text-cyan-700 hover:text-cyan-800"
                      >
                        synapseeduhub@gmail.com
                      </a>
                    </p>
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
                  Synapse Edu Hub is an education-focused platform. If you fill
                  out our contact form, register for an account, use OTP
                  verification, update your profile, join classrooms, access
                  study material, or use related portal features, some personal
                  information is processed to deliver those services.
                </p>
              </div>

              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className="rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-10"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-sm font-black text-white shadow-lg shadow-cyan-200">
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

              <article className="rounded-[2.5rem] border border-cyan-100 bg-gradient-to-br from-cyan-900 via-sky-800 to-indigo-800 p-7 text-white shadow-xl md:p-10">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                    <ChevronRight className="h-5 w-5 text-cyan-200" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">
                      Grievance And Privacy Requests
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-relaxed text-cyan-50">
                      If you have questions about this Privacy Policy or want to
                      request correction or review of your information, you may
                      contact us at{" "}
                      <a
                        href="mailto:synapseeduhub@gmail.com"
                        className="font-bold text-white underline decoration-white/40"
                      >
                        synapseeduhub@gmail.com
                      </a>
                      . We will review requests in a reasonable timeframe,
                      subject to platform, academic, operational, and legal
                      requirements.
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

export default PrivacyPolicy;
