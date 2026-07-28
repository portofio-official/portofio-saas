import type { FreelancerData } from "./schema";

export const freelancerDefaults: FreelancerData = {
  profile: {
    fullName: "Alex Rivera",
    headline: "Freelance Designer & Developer",
    bio: "I help startups and small businesses build products their users love.",
    photoUrl: "",
    location: "Remote — Worldwide",
  },
  tagline: "Available for new projects",
  skills: ["UI/UX Design", "React", "Next.js", "Figma", "TypeScript"],
  projects: [
    {
      title: "Brand Refresh for TechFlow",
      description: "Full redesign of marketing site and design system.",
      imageUrl: "",
      link: "",
    },
  ],
  testimonials: [
    {
      name: "Sari Dewi",
      role: "CEO, TechFlow",
      quote: "Alex delivered beyond our expectations — fast, professional, and genuinely invested in our success.",
    },
  ],
  pricing: [
    {
      name: "Starter",
      price: 800,
      currency: "USD",
      period: "one-time",
      features: ["1 page", "Responsive design", "3 revisions"],
      highlighted: false,
    },
    {
      name: "Growth",
      price: 2400,
      currency: "USD",
      period: "one-time",
      features: ["Up to 5 pages", "Design + dev", "Unlimited revisions", "1 month support"],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: 0,
      currency: "USD",
      period: "one-time",
      features: ["Custom scope", "Dedicated support", "SLA available"],
      highlighted: false,
    },
  ],
  availableForWork: true,
  contact: {
    email: "alex@example.com",
    phone: "",
  },
  socials: [],
  theme: {
    accentColor: "#3532E5",
    font: "sans",
  },
};
