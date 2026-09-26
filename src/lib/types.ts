export interface Account {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  plan: string;
}

export interface PortfolioProfile {
  display_name: string | null;
  title: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
}

export type PortfolioStatus =
  | "draft"
  | "published"
  | "unpublished"
  | "suspended"
  | "archived";

export interface Portfolio {
  id: string;
  username: string | null;
  status: PortfolioStatus;
  template: string;
  accent: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | null;
  is_primary: boolean;
  username_change_count: number;
  username_changed_at: string | null;
  profile: PortfolioProfile | null;
}

export interface Availability {
  username: string;
  available: boolean;
  reason: string | null;
  message: string | null;
  suggestions: string[];
}
