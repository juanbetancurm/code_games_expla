import { useEffect, useState } from "react";

// In-page section navigation. Buttons scroll to a section without changing the
// URL hash, so the lesson route (#/maze, #/bird, #/turtle) is preserved.
export function ProgressRail({ items, label, className = "" }) {
  const [current, setCurrent] = useState(items[0]?.id);
  const idsKey = items.map((item) => item.id).join("|");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const ratios = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => ratios.set(entry.target.id, entry.intersectionRatio));
      let best = null;
      let bestRatio = 0;
      ratios.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          best = id;
          bestRatio = ratio;
        }
      });
      if (best) setCurrent(best);
    }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
    idsKey.split("|").forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [idsKey]);

  const goTo = (id) => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <nav className={`progress-rail ${className}`} aria-label={label}>
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          className={current === item.id ? "is-current" : ""}
          aria-current={current === item.id ? "step" : undefined}
          aria-label={item.title}
          title={item.title}
          onClick={() => goTo(item.id)}
        >
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
