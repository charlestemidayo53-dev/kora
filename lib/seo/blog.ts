export type BlogSection = { heading?: string; paragraphs: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  datePublished: string; // ISO date, e.g. "2026-11-02"
  dateModified?: string;
  sections: BlogSection[];
};

// Add real, finished articles here. Nothing is published, listed or put in the sitemap until you do.
export const BLOG_POSTS: BlogPost[] = [];

export function getPostBySlug(slug: string): BlogPost | null {
  return BLOG_POSTS.find(function (p) { return p.slug === slug; }) || null;
}