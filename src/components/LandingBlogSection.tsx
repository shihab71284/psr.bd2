"use client";

import { useEffect, useId, useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  Heart,
  MessageSquare,
  PenTool,
  Scale,
  Search,
  Share2,
  Sparkles,
  Tag,
  User,
  X,
} from "lucide-react";
import { createBlogPost, likeBlogPost } from "@/app/actions";

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  authorName: string;
  authorRole: string; // 'developer' | 'client' | 'lawyer'
  authorTitle?: string | null;
  category: string;
  tags?: string | null;
  likesCount?: number | null;
  readMinutes?: number | null;
  isFeatured?: boolean | null;
  createdAt: string | Date;
}

interface LandingBlogSectionProps {
  initialPosts: BlogPostItem[];
  showWriteModalByDefault?: boolean;
}

const CATEGORY_LABELS: Record<string, { bn: string; en: string }> = {
  tax_tech: { bn: "আইনি প্রযুক্তি ও অ্যালগরিদম", en: "Tax Tech & Logic" },
  client_story: { bn: "ক্লায়েন্ট সাফল্য ও অভিজ্ঞতা", en: "Client Case Story" },
  audit_defense: { bn: "অডিট ডিফেন্স ও লিগ্যাল গাইড", en: "Audit Defense" },
  law_update: { bn: "আয়কর আইন ও এসআরও আপডেট", en: "Tax Law Updates" },
};

export default function LandingBlogSection({
  initialPosts,
  showWriteModalByDefault = false,
}: LandingBlogSectionProps) {
  const [posts, setPosts] = useState<BlogPostItem[]>(initialPosts);
  const [isWriterOpen, setIsWriterOpen] = useState(showWriteModalByDefault);
  const [activeTab, setActiveTab] = useState<"all" | "developer" | "client" | "lawyer">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPostItem | null>(null);

  // Form State
  const [authorRole, setAuthorRole] = useState<"developer" | "client" | "lawyer">("developer");
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [category, setCategory] = useState("tax_tech");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formId = useId();

  // Listen to external write triggers (e.g. from Hero or Header)
  useEffect(() => {
    const handleOpenWriter = () => {
      setIsWriterOpen(true);
    };
    const handleHashChange = () => {
      if (window.location.hash === "#write-post") {
        setIsWriterOpen(true);
      }
    };
    window.addEventListener("open-blog-writer", handleOpenWriter);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("open-blog-writer", handleOpenWriter);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchRole =
        activeTab === "all"
          ? true
          : activeTab === "client"
          ? p.authorRole === "client"
          : activeTab === "developer"
          ? p.authorRole === "developer"
          : p.authorRole === "lawyer";

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        (p.tags && p.tags.toLowerCase().includes(q));

      return matchRole && matchQuery;
    });
  }, [posts, activeTab, searchQuery]);

  // Handle Form Submit
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!title.trim() || !content.trim()) {
      setErrorMessage("অনুগ্রহ করে শিরোনাম ও মূল বিষয়বস্তু পূরণ করুন।");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("authorName", authorName || (authorRole === "developer" ? "শিহাবুর রহমান" : "ক্লায়েন্ট শুভানুধ্যায়ী"));
    formData.append("authorRole", authorRole);
    formData.append("authorTitle", authorTitle || (authorRole === "developer" ? "সফটওয়্যার আর্কিটেক্ট" : authorRole === "lawyer" ? "ট্যাক্স আইনজীবী" : "ব্যবসা করদাতা"));
    formData.append("category", category);
    formData.append("tags", tags);

    startTransition(async () => {
      try {
        const res = await createBlogPost(formData);
        if (res.success) {
          // Optimistically add the new post at the top
          const newPost: BlogPostItem = {
            id: "post-" + Date.now(),
            title,
            slug: res.slug,
            content,
            excerpt: content.slice(0, 180) + "...",
            authorName: authorName || (authorRole === "developer" ? "শিহাবুর রহমান" : "ক্লায়েন্ট শুভানুধ্যায়ী"),
            authorRole,
            authorTitle: authorTitle || (authorRole === "developer" ? "সফটওয়্যার আর্কিটেক্ট" : "করদাতা ও ক্লায়েন্ট"),
            category,
            tags,
            likesCount: 1,
            readMinutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 150)),
            isFeatured: false,
            createdAt: new Date(),
          };

          setPosts([newPost, ...posts]);
          setSuccessMessage("আপনার ব্লগটি সফলভাবে প্রকাশিত হয়েছে!");
          // Reset fields
          setTitle("");
          setContent("");
          setTags("");
          setTimeout(() => {
            setIsWriterOpen(false);
            setSuccessMessage("");
          }, 1500);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "ব্লগ প্রকাশ করতে সমস্যা হয়েছে।");
      }
    });
  };

  // Handle Like
  const handleLike = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (likedPosts[postId]) return;

    setLikedPosts((prev) => ({ ...prev, [postId]: true }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p))
    );

    startTransition(async () => {
      await likeBlogPost(postId);
    });
  };

  // Handle Share to Social Media
  const handleShare = (post: BlogPostItem, platform: "wa" | "fb" | "li" | "copy", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/#post-${post.id}` : "";
    const shareText = `BTCP কমিউনিটি ব্লগে পড়ুন: "${post.title}"—${post.authorName} (${post.authorRole === "developer" ? "ডেভেলপার" : "ক্লায়েন্ট"})\n${url}`;

    if (platform === "wa") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
    } else if (platform === "fb") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`, "_blank");
    } else if (platform === "li") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
    } else if (platform === "copy") {
      navigator.clipboard.writeText(shareText);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "developer") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/80">
          <Code2 className="h-3 w-3 text-blue-600" />
          ডেভেলপার নোট
        </span>
      );
    }
    if (role === "client") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/80">
          <User className="h-3 w-3 text-emerald-600" />
          ক্লায়েন্ট মতামত
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200/80">
        <Scale className="h-3 w-3 text-purple-600" />
        আইনজীবী বিশ্লেষণ
      </span>
    );
  };

  return (
    <section id="blog-section" className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-bold text-emerald-800">
              <BookOpen className="h-3.5 w-3.5" />
              <span>উন্মুক্ত কমিউনিটি নলেজবেস</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ডেভেলপার ও ক্লায়েন্ট কমিউনিটি ব্লগ
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 max-w-2xl leading-relaxed">
              সফটওয়্যার ডেভেলপার হিসেবে টেকনিক্যাল আর্কিটেকচার শেয়ার করুন এবং ক্লায়েন্ট বা করদাতা হিসেবে আপনার অভিজ্ঞতা ও সমস্যা সমাধানের গল্প সরাসরি লাউঞ্জিং পেজে প্রকাশ করুন।
            </p>
          </div>

          {/* Trigger Write Post Button */}
          <button
            type="button"
            onClick={() => setIsWriterOpen(!isWriterOpen)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98] shrink-0 self-start md:self-auto"
          >
            <PenTool className="h-4 w-4" />
            {isWriterOpen ? "ফর্ম লুকান" : "নতুন ব্লগ লিখুন (Write Post)"}
          </button>
        </div>

        {/* ============================================================ */}
        {/* COLLAPSIBLE BLOG WRITER FORM (লাউঞ্জিং পেইজেই ব্লগ লেখার অপশন) */}
        {/* ============================================================ */}
        {isWriterOpen && (
          <div className="mt-8 rounded-2xl border-2 border-emerald-500/30 bg-white p-6 shadow-lg shadow-emerald-900/5 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <PenTool className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    লাউঞ্জিং পেজে নতুন ব্লগ প্রকাশ করুন
                  </h3>
                  <p className="text-xs text-slate-500">
                    আপনার পরিচয় নির্বাচন করুন এবং আপনার অভিজ্ঞতা ও প্রযুক্তিগত দর্শন শেয়ার করুন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWriterOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error or Success notification */}
            {errorMessage && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  ১. আপনার ভূমিকা নির্বাচন করুন (Who is writing?):
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthorRole("developer");
                      if (!category || category === "client_story") setCategory("tax_tech");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                      authorRole === "developer"
                        ? "border-blue-500 bg-blue-50/90 text-blue-800 ring-2 ring-blue-500/20 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <Code2 className="h-4 w-4 text-blue-600" />
                    আমি একজন ডেভেলপার
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthorRole("client");
                      setCategory("client_story");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                      authorRole === "client"
                        ? "border-emerald-500 bg-emerald-50/90 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <User className="h-4 w-4 text-emerald-600" />
                    আমি একজন ক্লায়েন্ট / করদাতা
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthorRole("lawyer");
                      if (!category) setCategory("audit_defense");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                      authorRole === "lawyer"
                        ? "border-purple-500 bg-purple-50/90 text-purple-800 ring-2 ring-purple-500/20 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <Scale className="h-4 w-4 text-purple-600" />
                    আমি একজন আইনজীবী / পরামর্শক
                  </button>
                </div>
              </div>

              {/* Author Details */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={
                      authorRole === "developer"
                        ? "যেমন: শিহাবুর রহমান"
                        : authorRole === "client"
                        ? "যেমন: তানভীর আহমেদ (উদ্যোক্তা)"
                        : "যেমন: অ্যাডভোকেট এম. এ. হাসান"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    আপনার পদবী বা পরিচয়
                  </label>
                  <input
                    type="text"
                    value={authorTitle}
                    onChange={(e) => setAuthorTitle(e.target.value)}
                    placeholder={
                      authorRole === "developer"
                        ? "যেমন: লিড আর্কিটেক্ট ও ফুল-স্ট্যাক ডেভেলপার"
                        : authorRole === "client"
                        ? "যেমন: ব্যবস্থাপনা পরিচালক, গ্রিনটেক"
                        : "যেমন: সদস্য, ঢাকা ট্যাক্সেস বার অ্যাসোসিয়েশন"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Title and Category */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ব্লগের শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: আয়কর আইন ২০২৩ এর ধারা ১০৪ অনুযায়ী অডিট নোটিশ এড়ানোর বাস্তব অভিজ্ঞতা..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিষয়শ্রেণী (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="tax_tech">আইনি প্রযুক্তি ও কোডিং (Tech)</option>
                    <option value="client_story">ক্লায়েন্ট গল্প ও অভিজ্ঞতা (Stories)</option>
                    <option value="audit_defense">অডিট ডিফেন্স ও লিগ্যাল গাইড (Legal)</option>
                    <option value="law_update">কর আইন ও এসআরও আপডেট (Rules)</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="যেমন: Next.js, আয়কর ২০২৩, ধারা ১০৪, করদাতা অভিজ্ঞতা, অডিট ২০২৫"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Main Content Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    ব্লগের মূল বিষয়বস্তু (Content) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    {previewMode ? "এডিটর মোড" : "প্রিভিউ দেখুন"}
                  </button>
                </div>

                {previewMode ? (
                  <div className="min-h-[140px] rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {content || "এখানে আপনার লেখার প্রিভিউ প্রদর্শিত হবে..."}
                  </div>
                ) : (
                  <textarea
                    rows={6}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="আপনার অভিজ্ঞতা, বিশ্লেষণ বা প্রযুক্তিগত সমাধান বিস্তারিত লিখুন..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
                  />
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriterOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isPending ? "প্রকাশ হচ্ছে..." : "এখনই প্রকাশ করুন (Publish)"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* BLOG NAVIGATION TABS & SEARCH BAR                            */}
        {/* ============================================================ */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "all"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              সকল ব্লগ ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("developer")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "developer"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:text-blue-700"
              }`}
            >
              <Code2 className="h-3 w-3" />
              ডেভেলপার নোট ({posts.filter((p) => p.authorRole === "developer").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("client")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "client"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              <User className="h-3 w-3" />
              ক্লায়েন্ট অভিজ্ঞতা ({posts.filter((p) => p.authorRole === "client").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("lawyer")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "lawyer"
                  ? "bg-purple-600 text-white"
                  : "text-slate-600 hover:text-purple-700"
              }`}
            >
              <Scale className="h-3 w-3" />
              আইনজীবী কলাম ({posts.filter((p) => p.authorRole === "lawyer").length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ব্লগ বা লেখক খুঁজুন..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* POST CARDS GRID                                              */}
        {/* ============================================================ */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-600">
                নির্বাচিত ক্যাটাগরির কোনো ব্লগ পাওয়া যায়নি।
              </p>
              <button
                type="button"
                onClick={() => setIsWriterOpen(true)}
                className="mt-3 text-xs font-bold text-emerald-700 hover:underline"
              >
                প্রথম ব্যক্তি হিসেবে আপনিই একটি ব্লগ লিখুন!
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isLiked = likedPosts[post.id];
              const isCopied = copiedPostId === post.id;
              const formattedDate =
                typeof post.createdAt === "string"
                  ? new Date(post.createdAt).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : post.createdAt.toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });

              return (
                <article
                  key={post.id}
                  id={`post-${post.id}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-md"
                >
                  <div>
                    {/* Role badge & read time */}
                    <div className="flex items-center justify-between gap-2 pb-3">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(post.authorRole)}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {CATEGORY_LABELS[post.category]?.bn || post.category}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {post.readMinutes || 3} মিনিট পাঠ
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => setSelectedPost(post)}
                      className="cursor-pointer text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2"
                    >
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {post.excerpt || post.content.slice(0, 160) + "..."}
                    </p>

                    {/* Tags */}
                    {post.tags && (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {post.tags.split(",").map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            <Tag className="h-2.5 w-2.5 text-slate-400" />
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer with Author details, Likes & Viral Share Buttons */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      {/* Author Info */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                            post.authorRole === "developer"
                              ? "bg-blue-100 text-blue-700"
                              : post.authorRole === "client"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {post.authorName.slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {post.authorName}
                          </p>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            {post.authorTitle || formattedDate}
                          </p>
                        </div>
                      </div>

                      {/* Read Full Post Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedPost(post)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        বিস্তারিত পড়ুন <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Engagement & Viral Social Share Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={(e) => handleLike(post.id, e)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                          isLiked
                            ? "bg-rose-50 text-rose-600 font-bold"
                            : "bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                        }`}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`}
                        />
                        <span>{post.likesCount || 0}</span>
                      </button>

                      {/* Viral Share Icons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium mr-1 hidden sm:inline">
                          শেয়ার:
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleShare(post, "wa", e)}
                          title="হোয়াটসঅ্যাপে শেয়ার করুন"
                          className="rounded-lg bg-slate-50 p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <span className="text-[11px] font-bold">WA</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleShare(post, "fb", e)}
                          title="ফেসবুকে শেয়ার করুন"
                          className="rounded-lg bg-slate-50 p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <span className="text-[11px] font-bold">FB</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleShare(post, "li", e)}
                          title="লিংকডইনে শেয়ার করুন"
                          className="rounded-lg bg-slate-50 p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                        >
                          <span className="text-[11px] font-bold">IN</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleShare(post, "copy", e)}
                          title="লিংক কপি করুন"
                          className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-slate-400" />
                              <span>কপি</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* ARTICLE FULL READING MODAL                                   */}
      {/* ============================================================ */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Role badge & category */}
            <div className="flex items-center gap-2 mb-3">
              {getRoleBadge(selectedPost.authorRole)}
              <span className="text-xs text-slate-500">
                {CATEGORY_LABELS[selectedPost.category]?.bn || selectedPost.category}
              </span>
            </div>

            {/* Post Title */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {selectedPost.title}
            </h2>

            {/* Author card in modal */}
            <div className="mt-4 flex items-center justify-between border-y border-slate-100 py-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                  {selectedPost.authorName.slice(0, 1)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedPost.authorName}</p>
                  <p className="text-[11px] text-slate-500">{selectedPost.authorTitle}</p>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                <p>
                  {typeof selectedPost.createdAt === "string"
                    ? new Date(selectedPost.createdAt).toLocaleDateString("bn-BD")
                    : selectedPost.createdAt.toLocaleDateString("bn-BD")}
                </p>
                <p>{selectedPost.readMinutes || 3} মিনিট পাঠ</p>
              </div>
            </div>

            {/* Article Content */}
            <div className="mt-6 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed space-y-4">
              {selectedPost.content}
            </div>

            {/* Tags */}
            {selectedPost.tags && (
              <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                {selectedPost.tags.split(",").map((t, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                  >
                    #{t.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Social Share & Action at bottom of reading modal */}
            <div className="mt-8 rounded-xl bg-slate-50 p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLike(selectedPost.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  <span>লাইক ({selectedPost.likesCount || 0})</span>
                </button>
                <span className="text-xs text-slate-500">এই লেখাটি ভালো লাগলে শেয়ার করুন:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShare(selectedPost, "wa")}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  হোয়াটসঅ্যাপ
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(selectedPost, "fb")}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  ফেসবুক
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(selectedPost, "copy")}
                  className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300"
                >
                  লিংক কপি
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
