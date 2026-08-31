import type { Metadata } from "next";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import PageHero from "@/components/site/PageHero";
import { Section, IndexLabel, SectionTitle, EmptyState } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Gallery · Vimtra Chennai Lions GC",
  description: "Tour frames — tournament, practice, Pride, and academy moments from the Vimtra Chennai Lions.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        variant="editorial"
        eyebrow="Tour Frames"
        title={["GALLERY"]}
      />

      <Section surface="ivory" size="tight">
        <GalleryGrid />
      </Section>
    </>
  );
}
