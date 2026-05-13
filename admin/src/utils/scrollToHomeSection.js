export const HOME_SCROLL_KEY = "synapse-home-scroll-target";

export const scrollToHomeSection = (sectionId, navigate, pathname) => {
  if (!sectionId) return;

  const scroll = () => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (pathname === "/") {
    requestAnimationFrame(scroll);
    return;
  }

  sessionStorage.setItem(HOME_SCROLL_KEY, sectionId);
  navigate("/");
};
