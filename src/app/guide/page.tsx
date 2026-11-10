import DocBody from "@/components/DocBody";
import PageHeader from "@/components/PageHeader";
import { GuideIcon } from "@/components/brand/icons";
import { pageMetadata } from "@/lib/og/metadata";
import { readPageContent } from "@/lib/page-content";

export const metadata = pageMetadata("/guide", {
  title: "Guide",
  description:
    "How the template is put together: where each piece lives, how pages and their markdown work, the palette tests, social cards, CSP, testing and deploying.",
});

export default async function Guide() {
  const content = await readPageContent("guide");
  return (
    <>
      <PageHeader
        section="Guide"
        icon={GuideIcon}
        title="How the template is put together."
        lede={content.block("lede")}
      />
      <div className="pt-14 pb-24">
        <DocBody markdown={content.block("body")} />
      </div>
    </>
  );
}
