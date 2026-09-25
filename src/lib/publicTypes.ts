export interface PublicProfile {
  display_name: string | null;
  title: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
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

export interface PublicPortfolio {
  username: string | null;
  template: string;
  profile: PublicProfile | null;
  projects: PublicProject[];
  skills: PublicSkill[];
  experience: PublicExperience[];
  education: PublicEducation[];
  links: PublicLink[];
}

export function dateRange(s: string | null, e: string | null, current?: boolean): string {
  const end = current ? "Present" : e;
  if (s && end) return `${s} – ${end}`;
  return s || end || "";
}
