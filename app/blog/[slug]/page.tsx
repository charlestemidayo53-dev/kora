import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { getPostBySlug } from "@/lib/seo/blog";
import { createMetadata, absoluteUrl } from "@/lib/seo/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return createMetadata({ title: "Article not found", path: "/blog/" + slug, noIndex: true });
  return createMetadata({ title: post.title, description: post.description, path: "/blog/" + post.slug });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    mainEntityOfPage: absoluteUrl("/blog/" + post.slug),
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: "/blog/" + post.slug },
        ]}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title }]} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">{post.title}</h1>
        <p className="text-xs text-gray-500 mb-6">{post.datePublished}</p>
        {post.sections.map(function (section, i) {
          return (
            <section key={i} className="mb-6">
              {section.heading && <h2 className="text-lg font-bold text-gray-900 mb-2">{section.heading}</h2>}
              {section.paragraphs.map(function (p, j) {
                return (
                  <p key={j} className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3">
                    {p}
                  </p>
                );
              })}
            </section>
          );
        })}
      </article>
    </div>
  );
}