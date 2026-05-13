import { BrowserRouter as Router, Routes, Route, useLocation, Link, useNavigate } from "react-router-dom";
import { getPublicSiteUrl } from "./utils/urlHelper";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import "./App.css";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/Shared/ProtectedRoute";
import SEO from "./components/Shared/SEO";
import DashboardLayout from "./components/Layout/DashboardLayout";
import SplashScreen from "./components/Shared/SplashScreen";

// Landing Page Sections
import Hero from "./components/Hero";
import Program from "./components/Program";
import About from "./components/About";
import VideoCard from "./components/VideoCard";
import TutorsMultilanguage from "./components/TutorsMultilanguage";
import Crescent from "./components/Crescent";
import Contact from "./components/Contact";
import FAQ from "./components/FAQ";
import Testimonials from "./components/Testimonials";
import PromotionBanner from "./components/PromotionBanner";
import AboutPage from "./pages/AboutPage";
import MaintenancePage from "./pages/MaintenancePage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";

// Portal Pages
import StudentDashboard from "./pages/Student/Dashboard";
import StudentExams from "./pages/Student/Exams";
import StudentClassrooms from "./pages/Student/Classrooms";
import StudentMaterials from "./pages/Student/Materials";
import StudentAnalytics from "./pages/Student/Analytics";
import TeacherDashboard from "./pages/Teacher/Dashboard";
import TeacherClassrooms from "./pages/Teacher/Classrooms";
import TeacherClassroom from "./pages/Teacher/Classroom";
import TeacherExams from "./pages/Teacher/Exams";
import TeacherSettings from "./pages/Teacher/Settings";
import TeacherAnalytics from "./pages/Teacher/Analytics";
import TeacherMaterials from "./pages/Teacher/Materials";
import LessonTracker from "./pages/Teacher/LessonTracker";

import PublicForm from "./pages/Public/EnquiryForm/PublicForm";
import StudentSettings from "./pages/Student/Settings";
import StudentClassroom from "./pages/Student/Classroom";
import ClassroomSelection from "./pages/Student/ClassroomSelection";
import Blogs from "./pages/Blogs/Blogs";
import BlogPost from "./pages/Blogs/BlogPost";
import ProgramDetail from "./pages/Programs/ProgramDetail";
import Notifications from "./pages/Notifications/Notifications";
import { HOME_SCROLL_KEY } from "./utils/scrollToHomeSection";
import { useAuth } from "./context/AuthContext";

import { getBanners, getSettings } from "./api/services";

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeBanners, setActiveBanners] = useState([]);
  const [showBanners, setShowBanners] = useState(false);

  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (role === "student") {
        navigate("/student/dashboard");
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchBannersAndSettings = async () => {
      try {
        const settings = await getSettings();
        setShowBanners(settings.showBanners);

        if (settings.showBanners) {
          const banners = await getBanners();
          if (banners && banners.length > 0) {
            setActiveBanners(banners);
          }
        }
      } catch (error) {
        console.error("Error fetching banner data:", error);
      }
    };
    fetchBannersAndSettings();
  }, []);

  useEffect(() => {
    const target = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (!target) return;

    sessionStorage.removeItem(HOME_SCROLL_KEY);
    requestAnimationFrame(() => {
      const section = document.getElementById(target);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, []);

  return (
    <>
      <section id="home" className="scroll-mt-20 md:scroll-mt-24">
        <Hero />
      </section>
      {showBanners && activeBanners.length > 0 && (
        <PromotionBanner
          banners={activeBanners}
        />
      )}
      <section id="programs" className="scroll-mt-20 md:scroll-mt-24">
        <Program />
      </section>
      <section id="about" className="scroll-mt-20 md:scroll-mt-24">
        <About />
        <div className="bg-[#f8fafc] pb-20 text-center">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-cyan-700 rounded-2xl font-bold border border-cyan-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
          >
            Learn more about our mission
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
      <TutorsMultilanguage />
      <VideoCard />
      <Crescent />
      <section id="reviews" className="scroll-mt-20 md:scroll-mt-24">
        <Testimonials />
      </section>
      <section id="faq" className="scroll-mt-20 md:scroll-mt-24">
        <FAQ />
      </section>
      <section id="contact" className="scroll-mt-20 md:scroll-mt-24">
        <Contact />
      </section>
    </>
  );
}

function RouteSeo() {
  const location = useLocation();
  const pathname = location.pathname;
  const siteUrl = getPublicSiteUrl();

  if (pathname.startsWith("/student")) {
    return <SEO title=" Student Portal" description="Secure Student portal for Synapse Edu Hub." noindex />;
  }

  if (pathname.startsWith("/teacher")) {
    return <SEO title="Secure Portal | Teacher Portal" description="Secure Teacher portal for Synapse Edu Hub." noindex />;
  }

  if (pathname === "/notifications") {
    return <SEO title=" Notifications" description="View your secure notifications." noindex />;
  }

  if (pathname.startsWith("/blogs/") || pathname.startsWith("/programs/")) {
    return null;
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Synapse Edu Hub | Synapse Connect",
    url: siteUrl || undefined,
    potentialAction: {
      "@type": "SearchAction",
      target: siteUrl ? `${siteUrl}/blogs?search={search_term_string}` : "/blogs?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Synapse Edu Hub | Synapse Connect",
    url: siteUrl || undefined,
    email: "synapseeduhub@gmail.com",
    telephone: "+91 81579 30567",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mavoor",
      addressRegion: "Kerala",
      postalCode: "673661",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/synapse_edu.hub",
      "https://www.facebook.com/share/1KBy2iguoK/",
      "https://www.linkedin.com/in/synapse-edu-hub-9b788b371",
      "https://youtube.com/@synapseeduhub",
    ],
  };

  const seoByPath = {
    "/": {
      title: "Synapse Edu Hub | Synapse Connect | India's Most Focused Learning Ecosystem",
      description:
        "India's most focused learning ecosystem. Synapse Edu Hub & Synapse Connect provide expert mentors, mock tests, and study materials for academic success.",
      keywords:
        "Synapse Edu Hub, Synapse Connect, online coaching Kerala, academic mentoring, mock tests, study materials, multilingual tuition",
      structuredData: [websiteSchema, organizationSchema],
    },
    "/about": {
      title: "About Synapse Edu Hub | Student-first academic coaching",
      description:
        "Learn about Synapse Edu Hub, our mission, mentors, and multilingual learning approach for students across Kerala and India.",
      keywords:
        "about Synapse Edu Hub, education company Kerala, student mentoring, academic coaching",
    },
    "/blogs": {
      title: "Education Blog & Study Resources | Synapse Edu Hub",
      description:
        "Explore exam tips, study strategies, and practical learning resources from Synapse Edu Hub experts.",
      keywords:
        "study tips blog, exam preparation articles, student resources, Synapse Edu Hub blog",
    },
    "/privacy-policy": {
      title: "Privacy Policy | Synapse Edu Hub",
      description: "Read how Synapse Edu Hub collects, uses, and protects your personal information.",
      keywords: "privacy policy, Synapse Edu Hub privacy",
    },
    "/terms-conditions": {
      title: "Terms & Conditions | Synapse Edu Hub",
      description: "Review the terms and conditions for using Synapse Edu Hub services and platforms.",
      keywords: "terms and conditions, Synapse Edu Hub terms",
    },
    "/maintenance": {
      title: "Maintenance Update | Synapse Edu Hub",
      description: "Synapse Edu Hub is temporarily under maintenance. Please check back shortly.",
      noindex: true,
    },
  };

  const pageSeo = seoByPath[pathname] ?? {
    title: "Page Not Found | Synapse Edu Hub",
    description: "The page you are looking for does not exist.",
    noindex: true,
  };

  return <SEO {...pageSeo} />;
}

function AppContent() {
  const location = useLocation();

  const isDashboardRoute =
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/teacher");

  // --- Maintenance Mode ---
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    getSettings()
      .then((s) => {
        const mode = !!s?.maintenanceMode;
        setMaintenanceMode(mode);
      })
      .catch((err) => {
        console.error('[MAINTENANCE] Failed to fetch settings:', err);
      })
      .finally(() => setSettingsLoaded(true));
  }, []);

  const userInfo = (() => {
    try { return JSON.parse(localStorage.getItem("userInfo")) || {}; }
    catch { return {}; }
  })();
  const isAdminUser = userInfo?.role === "admin" || userInfo?.role === "superadmin";

  // Show maintenance page for non-admins when maintenance mode is on
  const showMaintenance = settingsLoaded && maintenanceMode && !isAdminUser;

  // Hide nav/footer/whatsapp on dashboards or when maintenance is active
  const showFloatingWhatsApp = !isDashboardRoute && !showMaintenance;
  const showFooter = !isDashboardRoute && !showMaintenance;
  const showNavbar = !isDashboardRoute && !showMaintenance;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <RouteSeo />
      {showNavbar && <Navbar />}
      {showFloatingWhatsApp && <FloatingWhatsApp />}
      <div className={`flex-1 ${showNavbar ? "mt-20 md:mt-24" : ""}`}>
        {showMaintenance ? (
          <MaintenancePage />
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Public Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:idOrSlug" element={<BlogPost />} />
            <Route path="/programs/:id" element={<ProgramDetail />} />
            <Route path="/form/:slug" element={<PublicForm />} />

            {/* General Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/classrooms" element={<StudentClassrooms />} />
                <Route path="/student/exams" element={<StudentExams />} />
                <Route path="/student/materials" element={<StudentMaterials />} />
                <Route path="/student/analytics" element={<StudentAnalytics />} />
                <Route path="/student/settings" element={<StudentSettings />} />
                <Route path="/student/classroom" element={<StudentClassroom />} />
                <Route path="/student/select-classroom" element={<ClassroomSelection />} />
                <Route path="/student/lesson-tracker" element={<LessonTracker />} />
              </Route>
            </Route>

            {/* Teacher Routes */}
            <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/classrooms" element={<TeacherClassrooms />} />
                <Route path="/teacher/classroom" element={<TeacherClassroom />} />
                <Route path="/teacher/exams" element={<TeacherExams />} />
                <Route path="/teacher/materials" element={<TeacherMaterials />} />
                <Route path="/teacher/lesson-tracker" element={<LessonTracker />} />
                <Route path="/teacher/settings" element={<TeacherSettings />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </div>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Router>
        <AppContent />
      </Router>
    </>
  );
}

export default App;
