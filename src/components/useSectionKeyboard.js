import { useEffect, useRef } from "react";

const keyActions = { arrowright: "next", arrowleft: "previous", r: "reset", p: "play" };

// Keyboard / presenter-clicker control for the simulation section in view:
// → next, ← previous, R reset, P play or pause. PageUp/PageDown still scroll.
export function useSectionKeyboard(sectionRef, actions) {
  const latest = useRef(actions);
  useEffect(() => {
    latest.current = actions;
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return undefined;
    let inView = false;
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= 0.55 || entry.intersectionRect.height >= window.innerHeight * 0.6;
    }, { threshold: [0, 0.25, 0.55, 0.8, 1] });
    observer.observe(section);

    const onKeyDown = (event) => {
      if (!inView || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      if (document.querySelector("[role='dialog']")) return;
      const action = keyActions[event.key.toLowerCase()];
      if (!action) return;
      event.preventDefault();
      latest.current[action]?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sectionRef]);
}
