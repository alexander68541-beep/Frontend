export interface PublicProfile {
  display_name: string | null;
  title: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  tagline: string | null;
  pronouns: string | null;
  about: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  availability: string | null;
  resume_url: string | null;
}
export interface PublicProject {
  id: string; title: string; role: string | null; description: string | null;
  url: string | null; image_url: string | null; tags: string[];
  start_date: string | null; end_date: string | null; is_featured: boolean;
}
export interface PublicSkill { id: string; name: string; category: string | null; level: number | null; }
export interface PublicExperience {
  id: string; company: string; title: string | null; location: string | null;
  description: string | null; start_date: string | null; end_date: string | null; is_current: boolean;
}
export interface PublicEducation {
  id: string; school: string; degree: string | null; field: string | null;
  start_date: string | null; end_date: string | null; description: string | null;
}
export interface PublicLink { id: string; platform: string; url: string; label: string | null; }
export interface PublicService { id: string; title: string; description: string | null; price: string | null; }
export interface PublicCertification { id: string; name: string; issuer: string | null; issue_date: string | null; credential_id: string | null; url: string | null; }
export interface PublicAchievement { id: string; title: string; description: string | null; date: string | null; }
export interface PublicTestimonial { id: string; author: string; role: string | null; quote: string; avatar_url: string | null; }
export interface PublicPublication { id: string; title: string; publisher: string | null; date: string | null; url: string | null; description: string | null; }
export interface PublicGalleryItem { id: string; image_url: string; caption: string | null; }
export interface PublicVideo { id: string; title: string | null; url: string; }

export interface PublicPortfolio {
  username: string | null;
  template: string;
  accent: string;
  hide_branding: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | null;
  profile: PublicProfile | null;
  projects: PublicProject[];
  skills: PublicSkill[];
  experience: PublicExperience[];
  education: PublicEducation[];
  links: PublicLink[];
  services: PublicService[];
  certifications: PublicCertification[];
  achievements: PublicAchievement[];
  testimonials: PublicTestimonial[];
  publications: PublicPublication[];
  gallery: PublicGalleryItem[];
  videos: PublicVideo[];
}

export function dateRange(s: string | null, e: string | null, current?: boolean): string {
  const end = current ? "Present" : e;
  if (s && end) return `${s} – ${end}`;
  return s || end || "";
}


export function videoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id && /^[0-9]+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}


export function ext(url: string | null | undefined): string {
  if (!url) return "#";
  const u = url.trim();
  if (/^(https?:|mailto:|tel:|\/)/i.test(u)) return u;
  return "https://" + u;
}
