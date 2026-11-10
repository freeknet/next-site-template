import PageHeader from "@/components/PageHeader";
import { AboutIcon } from "@/components/brand/icons";
import { Prose } from "@/components/ui";
import { pageMetadata } from "@/lib/og/metadata";
import { readPageContent } from "@/lib/page-content";

export const metadata = pageMetadata("/about", {
  title: "About",
  description:
    "What the template is for: statically exported marketing, project and documentation sites, with their checks in place from the first commit, and where it stops.",
});

export default async function About() {
  const content = await readPageContent("about");
  return (
    <>
      <PageHeader
        section="About"
        icon={AboutIcon}
        title="What the template is for."
        lede={content.block("lede")}
      />
      <div className="mx-auto max-w-[1400px] px-6 pt-6 pb-24 sm:px-10">
        <Prose>{content.block("body")}</Prose>
      </div>
    </>
  );
}
