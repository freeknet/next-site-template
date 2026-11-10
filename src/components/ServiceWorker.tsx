"use client";

import { useEffect } from "react";
import { PWA } from "@/lib/site";

/*
 * Registers the service worker (out/sw.js, written by scripts/build-sw.mjs) in production.
 *
 * Not in `next dev`: there is no sw.js there, and a worker caching dev builds only gets in the way.
 * With PWA off, it unregisters any worker an earlier build installed, alongside the self-removing
 * sw.js the build publishes, so a returning visitor is cleaned up on their first page view.
 *
 * Registered after the page has loaded, so installing the worker never competes with the page.
 * Rendered from the layout as a component rather than an inline script, so the hashed CSP needs no
 * change.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    if (!PWA) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())));
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error: unknown) => {
        // A failed registration only costs offline support; the page itself is unaffected.
        console.warn("Service worker registration failed:", error);
      });
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
