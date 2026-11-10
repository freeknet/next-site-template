import Link from "next/link";
import Mark from "@/components/brand/Mark";
import Wordmark from "@/components/brand/Wordmark";
import { NAME } from "@/lib/site";

/*
 * The header's home link: the mark beside the wordmark. Below 400px there is
 * room for the mark alone; the aria-label names the destination either way.
 */
export default function SiteHeaderLogo() {
  return (
    <Link
      href="/"
      aria-label={`${NAME}, home`}
      className="flex items-center gap-3 focus-visible:outline-offset-4"
    >
      <Mark size={28} />
      <Wordmark size={17} className="hidden min-[400px]:inline-flex" />
    </Link>
  );
}
