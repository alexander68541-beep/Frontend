import type { PublicPortfolio } from "@/lib/publicTypes";

// Sample data used for template previews (no real user data).
export const DEMO_PORTFOLIO: PublicPortfolio = {
  username: "demo",
  template: "minimal",
  accent: "#7c6cff",
  hide_branding: false,
  seo_title: null,
  seo_description: null,
  seo_image: null,
  profile: {
    display_name: "Arya Sen",
    title: "Product Designer & Developer",
    tagline: "I design calm, useful products.",
    pronouns: "she/her",
    bio: "Designer-developer with 6+ years crafting digital products people love. Focused on clarity, systems and delightful detail.",
    about: "I'm a product designer and front-end developer based in Dhaka. I help teams turn fuzzy ideas into shipped products — from research and prototyping to polished, accessible interfaces.\n\nPreviously at two startups leading design systems and growth surfaces.",
    location: "Dhaka, Bangladesh",
    avatar_url: "https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill,g_face/woman.jpg",
    email: "hello@example.com",
    phone: "+880 1700 000000",
    website: "https://example.com",
    availability: "Open to freelance",
    resume_url: "https://example.com/cv.pdf",
  },
  links: [
    { id: "1", platform: "GitHub", url: "https://github.com", label: "GitHub" },
    { id: "2", platform: "LinkedIn", url: "https://linkedin.com", label: "LinkedIn" },
    { id: "3", platform: "Website", url: "https://example.com", label: "Website" },
  ],
  projects: [
    { id: "1", title: "Nimbus Analytics", role: "Lead Designer", description: "A calm analytics dashboard for busy teams — real-time, responsive, accessible.", url: "https://example.com", image_url: "https://res.cloudinary.com/demo/image/upload/w_800/sample.jpg", tags: ["Product", "Dashboard", "React"], start_date: "2023", end_date: "2024", is_featured: true },
    { id: "2", title: "Folio Brand", role: "Designer", description: "Identity and marketing site for a portfolio SaaS.", url: "https://example.com", image_url: "https://res.cloudinary.com/demo/image/upload/w_800/balloons.jpg", tags: ["Branding", "Web"], start_date: "2023", end_date: null, is_featured: false },
  ],
  skills: [
    { id: "1", name: "Figma", category: "Design", level: 5 },
    { id: "2", name: "React", category: "Dev", level: 4 },
    { id: "3", name: "TypeScript", category: "Dev", level: 4 },
    { id: "4", name: "Design Systems", category: "Design", level: 5 },
  ],
  experience: [
    { id: "1", company: "Acme Studio", title: "Senior Product Designer", location: "Remote", description: "Led the design system and core product surfaces.", start_date: "2022", end_date: null, is_current: true },
    { id: "2", company: "Nova Labs", title: "Product Designer", location: "Dhaka", description: "Shipped onboarding and growth features.", start_date: "2019", end_date: "2022", is_current: false },
  ],
  education: [
    { id: "1", school: "University of Dhaka", degree: "BSc", field: "Computer Science", start_date: "2015", end_date: "2019", description: null },
  ],
  services: [
    { id: "1", title: "Product design", description: "End-to-end product and UI design.", price: "From $1,500" },
    { id: "2", title: "Design systems", description: "Scalable component libraries.", price: "From $2,000" },
  ],
  certifications: [
    { id: "1", name: "Google UX Design", issuer: "Google", issue_date: "2022", credential_id: null, url: "https://example.com" },
  ],
  achievements: [
    { id: "1", title: "Awwwards SOTD", description: "Site of the Day for a client project.", date: "2023" },
  ],
  testimonials: [
    { id: "1", author: "Jane Cooper", role: "CEO, Acme", quote: "One of the most thoughtful designers I've worked with.", avatar_url: null },
  ],
  publications: [
    { id: "1", title: "Designing for trust", publisher: "Smashing Magazine", date: "2023", url: "https://example.com", description: "How micro-interactions build confidence." },
  ],
  gallery: [
    { id: "1", image_url: "https://res.cloudinary.com/demo/image/upload/w_600/sample.jpg", caption: "Case study" },
    { id: "2", image_url: "https://res.cloudinary.com/demo/image/upload/w_600/balloons.jpg", caption: "Brand" },
  ],
  videos: [],
};
