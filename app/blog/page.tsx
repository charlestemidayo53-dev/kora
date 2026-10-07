import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { BLOG_POSTS } from "@/lib/seo/blog";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Trade Guides for African B2B Buyers and Suppliers",
  description:
    "Practical guides on sourcing, buying in bulk and trading agricultural and industrial products across Africa, from Kora.",
  path: "/blog",
  noIndex: BLOG_POSTS.length === 0,
});

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog" }]} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <h1 className="text-xl sm:text-3xl font-black text-gray-900 mb-4">Trade guides</h1>
        {BLOG_POSTS.length === 0 ? (
          <p className="text-gray-600 text-sm">No guides have been published yet.</p>
        ) : (
          <ul className="space-y-4">
            {BLOG_POSTS.map(function (post) {
              return (
                <li key={post.slug}>
                  <Link href={"/blog/" + post.slug} className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-[#F97316] transition">
                    <span className="block font-semibold text-gray-900">{post.title}</span>
                    <span className="block text-sm text-gray-600 mt-1">{post.description}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}