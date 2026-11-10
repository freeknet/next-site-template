"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Entrance motion: a short fade with a few pixels of travel, played once when
 * the element first scrolls into view.
 *
 * Where the hidden state comes from is the whole design problem. Rendering it
 * in the markup ships `opacity: 0` in the HTML, so without JavaScript the
 * section is invisible forever. Applying it at hydration makes content above
 * the fold paint, vanish and fade back in. So the hidden state is CSS, gated
 * on the `js` class the pre-paint script puts on <html>, and this component
 * only decides *when* to reveal.
 */

type RevealProps = {
  children: ReactNode;
  /** Seconds of stagger, for revealing a row of cells in sequence. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
};

export default function Reveal({
  children,
  delay = 0,
  className,
  as: Component = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [inView]);

  return (
    <Component
      // The ref types differ per tag; the element type is the same either way.
      ref={ref as React.Ref<never>}
      className={`reveal${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      style={delay > 0 ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Component>
  );
}
