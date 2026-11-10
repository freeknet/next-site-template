"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveRoute, NAV } from "@/lib/site";

/*
 * Uppercase with wide tracking (wide spacing only for short all-caps labels),
 * and a 2px accent underline on the current section: the header's only use of
 * the accent besides the mark.
 */
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV.map((item) => {
        const active = isActiveRoute(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`panel-hover border-b-2 pb-[3px] text-[13px] font-semibold tracking-widest uppercase ${
              active
                ? "border-accent text-text"
                : // The hover previews the marker the current section carries,
                  // in grey rather than the accent — one accent per view, and
                  // the page you are on owns it.
                  "text-secondary hover:text-text hover:border-hairline-strong border-transparent"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
