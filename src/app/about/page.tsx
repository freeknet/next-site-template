import PageHeader from "@/components/PageHeader";
import { AboutIcon } from "@/components/brand/icons";
import { Prose } from "@/components/ui";
import { pageMetadata } from "@/lib/og/metadata";
import { readPageContent } from "@/lib/page-content";

export const metadata = pageMetadata("/about", {
  title: "About",
  description:
    "Where the template comes from: the conventions four production Next.js sites arrived at, gathered once with the project-specific parts removed.",
});

export default async function About() {
  const content = await readPageContent("about");
  return (
    <>
      <PageHeader
        section="About"
        icon={AboutIcon}
        title="Four sites, one shape."
        lede={content.block("lede")}
      />
      <div className="mx-auto max-w-[1400px] px-6 pt-6 pb-24 sm:px-10">
        <Prose>{content.block("body")}</Prose>
      </div>
    </>
  );
}
