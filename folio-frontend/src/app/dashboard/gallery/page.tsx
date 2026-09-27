"use client";
import { CrudSection } from "@/components/CrudSection";
export default function GalleryPage() {
  return (
    <CrudSection
      title="Gallery" subtitle="A grid of images — shots, photos, visuals." endpoint="/portfolio/gallery" queryKey="gallery"
      primary="caption" secondary={undefined} addLabel="Add image"
      emptyText="Add images to your gallery."
      fields={[
        { name: "image_url", label: "Image", type: "image", required: true },
        { name: "caption", label: "Caption (optional)", placeholder: "What is this?" },
      ]}
    />
  );
}
