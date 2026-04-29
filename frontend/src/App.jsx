import { BrowserRouter as Router, Routes, Route, useLocation, Link } from "react-router-dom";
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

// Landing Page Sections (Still in root components for now, can move later)
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
import TeacherDashboard from "./pages/Teacher/Dashboard";
import TeacherClassrooms from "./pages/Teacher/Classrooms";
import TeacherClassroom from "./pages/Teacher/Classroom";
import TeacherExams from "./pages/Teacher/Exams";
import TeacherSettings from "./pages/Teacher/Settings";
import TeacherAnalytics from "./pages/Teacher/Analytics";
import TeacherMaterials from "./pages/Teacher/Materials";
import AdminDashboard from "./pages/Admin/dashboard/Dashboard";
import AdminUserManagement from "./pages/Admin/users/UserManagement";
import AdminClassroomManagement from "./pages/Admin/classrooms/ClassroomManagement";
import AdminClassroomDetails from "./pages/Admin/classrooms/ClassroomDetails";
import AdminCreateUser from "./pages/Admin/users/CreateUser";
import AdminAuth from "./pages/Admin/auth/AdminAuth";
import AdminAnnouncements from "./pages/Admin/content/Announcements";
import AdminExams from "./pages/Admin/exams/ExamsManagement";
import AdminPromotions from "./pages/Admin/promotions/Promotions";
import AdminResources from "./pages/Admin/content/LibraryManagement";
import AdminSettings from "./pages/Admin/settings/Settings";
import AdminAuditLogs from "./pages/Admin/reports/AuditLogs";
import AdminReports from "./pages/Admin/reports/Reports";
import AdminBlogManagement from "./pages/Admin/content/BlogManagement";
import AdminProgramManagement from "./pages/Admin/content/ProgramManagement";
import AdminBannerManagement from "./pages/Admin/content/BannerManagement";
import StudentSettings from "./pages/Student/Settings";
import StudentClassroom from "./pages/Student/Classroom";
import ClassroomSelection from "./pages/Student/ClassroomSelection";
import Blogs from "./pages/Blogs/Blogs";
import BlogPost from "./pages/Blogs/BlogPost";
import ProgramDetail from "./pages/Programs/ProgramDetail";
import Notifications from "./pages/Notifications/Notifications";
import { HOME_SCROLL_KEY } from "./utils/scrollToHomeSection";

import { getBanners, getSettings } from "./api/services";

function LandingPage() {
  const [activeBanners, setActiveBanners] = useState([]);
  const [showBanners, setShowBanners] = useState(false);

  useEffect(() => {
    const fetchBannersAndSettings = async () => {
      try {
        // Fetch settings first
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
  const siteUrl = (
    import.meta.env.VITE_SITE_URL && !import.meta.env.VITE_SITE_URL.includes("your-domain.com")
      ? import.meta.env.VITE_SITE_URL
      : typeof window !== "undefined"
        ? window.location.origin
        : ""
  ).replace(/\/$/, "");

  const isPrivateRoute =
    pathname.startsWith("/student") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/admin") ||
    pathname === "/notifications";

  if (isPrivateRoute) {
    return <SEO title="Secure Portal" description="Secure Synapse Edu Hub portal area." noindex />;
  }

  if (pathname.startsWith("/blogs/") || pathname.startsWith("/programs/")) {
    return null;
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Synapse Connect",
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
    name: "Synapse Connect",
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
      title: "Synapse Connect | Personalized Coaching, Study Materials & Online Exams",
      description:
        "Achieve academic success with Synapse Connect through expert mentors, multilingual learning support, mock tests, study materials, and performance tracking.",
      keywords:
        "Synapse Connect, online coaching Kerala, academic mentoring, mock tests, study materials, multilingual tuition",
      structuredData: [websiteSchema, organizationSchema],
    },
    "/about": {
      title: "About Synapse Connect | Student-first academic coaching",
      description:
        "Learn about Synapse Connect, our mission, mentors, and multilingual learning approach for students across Kerala and India.",
      keywords:
        "about Synapse Connect, education company Kerala, student mentoring, academic coaching",
    },
    "/blogs": {
      title: "Education Blog & Study Resources | Synapse Connect",
      description:
        "Explore exam tips, study strategies, and practical learning resources from Synapse Connect experts.",
      keywords:
        "study tips blog, exam preparation articles, student resources, Synapse Connect blog",
    },
    "/privacy-policy": {
      title: "Privacy Policy | Synapse Connect",
      description: "Read how Synapse Connect collects, uses, and protects your personal information.",
      keywords: "privacy policy, Synapse Connect privacy",
    },
    "/terms-conditions": {
      title: "Terms & Conditions | Synapse Connect",
      description: "Review the terms and conditions for using Synapse Connect services and platforms.",
      keywords: "terms and conditions, Synapse Connect terms",
    },
    "/maintenance": {
      title: "Maintenance Update | Synapse Connect",
      description: "Synapse Connect is temporarily under maintenance. Please check back shortly.",
      noindex: true,
    },
    "/admin-portal-auth": {
      title: "Admin Portal Login | Synapse Connect",
      description: "Secure admin login for Synapse Connect.",
      noindex: true,
    },
  };

  const pageSeo = seoByPath[pathname] ?? {
    title: "Page Not Found | Synapse Connect",
    description: "The page you are looking for does not exist.",
    noindex: true,
  };

  return <SEO {...pageSeo} />;
}

function AppContent() {
  const location = useLocation();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isHostAdmin = hostname.includes('admin.synapseeduhub.com') || hostname.startsWith('admin.');
  
  const isAdminAuth = location.pathname === "/admin-portal-auth" || (isHostAdmin && location.pathname === "/");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isDashboardRoute =
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/teacher") ||
    isAdminRoute;
  const showFloatingWhatsApp = !isAdminAuth && !isDashboardRoute;
  const showFooter = !isAdminAuth && !isDashboardRoute;
  const showNavbar = !isAdminAuth && !isDashboardRoute;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <RouteSeo />
      {showNavbar && <Navbar />}
      {showFloatingWhatsApp && <FloatingWhatsApp />}
      <div className={`flex-1 ${showNavbar ? "mt-20 md:mt-24" : ""}`}>
        <Routes>
          <Route path="/" element={isHostAdmin ? <AdminAuth /> : <LandingPage />} />
          <Route path="/admin-portal-auth" element={<AdminAuth />} />

          {/* Public Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:idOrSlug" element={<BlogPost />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />

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
              <Route path="/student/history" element={<div className="p-8"><h1>Exam History</h1></div>} />
              <Route path="/student/settings" element={<StudentSettings />} />
              <Route path="/student/classroom" element={<StudentClassroom />} />
              <Route path="/student/select-classroom" element={<ClassroomSelection />} />
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
              <Route path="/teacher/settings" element={<TeacherSettings />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "superadmin"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin/users/create" element={<AdminCreateUser />} />
              <Route path="/admin/classrooms" element={<AdminClassroomManagement />} />
              <Route path="/admin/classrooms/:id" element={<AdminClassroomDetails />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/exams" element={<AdminExams />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/promotions" element={<AdminPromotions />} />
              <Route path="/admin/resources" element={<AdminResources />} />
              <Route path="/admin/programs" element={<AdminProgramManagement />} />
              <Route path="/admin/blogs" element={<AdminBlogManagement />} />
              <Route path="/admin/banners" element={<AdminBannerManagement />} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
                <Route index element={<AdminAuditLogs />} />
              </Route>
              <Route path="/admin/payments" element={<div className="p-8"><h1>Payment Settings</h1></div>} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
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
