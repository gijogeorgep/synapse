import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let scopeCounter = 0;

const useGsapReveal = () => {
  const scopeRef = useRef(null);
  const scopeIdRef = useRef(`gsap-scope-${scopeCounter++}`);

  useEffect(() => {
    if (!scopeRef.current) return;

    scopeRef.current.dataset.gsapScope = scopeIdRef.current;

    const ctx = gsap.context(() => {
      const elements = gsap
        .utils
        .toArray("[data-gsap='reveal']")
        .filter((element) => element.closest("[data-gsap-scope]")?.dataset.gsapScope === scopeIdRef.current);

      elements.forEach((element) => {
        const el = element;
        const delay = Number(el.dataset.delay || 0);
        const duration = Number(el.dataset.duration || 0.9);
        const y = Number(el.dataset.y || 28);
        const x = Number(el.dataset.x || 0);
        const scale = Number(el.dataset.scale || 1);
        const start = el.dataset.start || "top 82%";
        const clip = el.dataset.clip === "true";

        const fromVars = {
          autoAlpha: 0,
          x,
          y,
          scale,
        };

        if (clip) {
          fromVars.clipPath = "inset(0 0 100% 0 round 2rem)";
        }

        gsap.fromTo(
          el,
          fromVars,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration,
            delay,
            ease: "power3.out",
            clipPath: clip ? "inset(0 0 0% 0 round 2rem)" : undefined,
            clearProps: "transform,opacity,visibility,clipPath",
            scrollTrigger: {
              trigger: el,
              start,
              once: true,
            },
          }
        );
      });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  return scopeRef;
};

export default useGsapReveal;
