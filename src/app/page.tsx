import { listBlogPosts } from "@/lib/queries";
import LandingHeader from "@/components/LandingHeader";
import LandingHero from "@/components/LandingHero";
import ViralTaxTool from "@/components/ViralTaxTool";
import LandingBlogSection, { BlogPostItem } from "@/components/LandingBlogSection";
import LandingPublicityBanner from "@/components/LandingPublicityBanner";
import LandingFooter from "@/components/LandingFooter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch community blog posts from database / in-memory store
  const rawPosts = await listBlogPosts();

  // Normalize posts data structure
  const blogPosts: BlogPostItem[] = (rawPosts || []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    excerpt: p.excerpt,
    authorName: p.authorName,
    authorRole: p.authorRole,
    authorTitle: p.authorTitle,
    category: p.category,
    tags: p.tags,
    likesCount: p.likesCount ?? 0,
    readMinutes: p.readMinutes ?? 3,
    isFeatured: p.isFeatured ?? false,
    createdAt: p.createdAt,
  }));

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Sticky Navigation Bar */}
      <LandingHeader />

      <main>
        {/* 2. Hero Section with Call to Actions */}
        <LandingHero />

        {/* 3. Community Blog Section (ডেভেলপার ও ক্লায়েন্টের ব্লগ লেখার উন্মুক্ত হাব) */}
        <LandingBlogSection initialPosts={blogPosts} />

        {/* 4. Viral Tax & Audit Risk Simulator (ওয়েবসাইটের প্রচার বৃদ্ধির ফ্রি ইনস্ট্যান্ট টুল) */}
        <ViralTaxTool />

        {/* 5. Publicity, Newsletter & Referral Growth Banner */}
        <LandingPublicityBanner />
      </main>

      {/* 6. Comprehensive Footer */}
      <LandingFooter />
    </div>
  );
}
