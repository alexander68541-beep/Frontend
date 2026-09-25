"use client";
import { CrudSection } from "@/components/CrudSection";
export default function VideosPage() {
  return (
    <CrudSection
      title="Videos" subtitle="Embed videos (YouTube / Vimeo links)." endpoint="/portfolio/videos" queryKey="videos"
      primary="title" secondary="url" addLabel="Add video"
      emptyText="Add video links to showcase."
      fields={[
        { name: "title", label: "Title (optional)", placeholder: "Product demo" },
        { name: "url", label: "Video URL", type: "url", required: true, placeholder: "https://youtube.com/watch?v=…" },
      ]}
    />
  );
}
