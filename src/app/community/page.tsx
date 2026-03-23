/**
 * @file src/app/community/page.tsx
 * @description 커뮤니티 메인 페이지 — DB 연동 버전.
 * 카테고리별 게시판, 실제 게시물 목록, 새 글 작성 버튼.
 * Sci-Fi 잔존 스타일 제거, 클린 미니멀 라이트 테마 적용.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Music2,
  MessageSquare,
  Info,
  Hash,
  Plus,
  ChevronRight,
} from "lucide-react";
import { getCategories } from "@/lib/actions/categories";

type Category = any; // type Category = Awaited<ReturnType<typeof getCategories>>[number];
type Post = Awaited<ReturnType<typeof getPostsByCategory>>[number];

// ─── 게시물 카드 ──────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      })
    : "—";

  const author =
    post.authorName ?? post.authorEmail?.split("@")[0] ?? "Unknown";

  const initials = author.slice(0, 2).toUpperCase();

  // HTML → 미리보기 텍스트 (태그 제거)
  const preview = post.contentHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  return (
    <Link
      href={`/community/${post.id}`}
      className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors group"
    >
      {/* 아바타 */}
      <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 text-xs font-semibold">
        {initials}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs text-muted-foreground">{author}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <p className="font-medium text-foreground truncate">{post.title}</p>
        <p className="text-sm text-muted-foreground truncate mt-0.5">
          {preview}
        </p>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center" />
    </Link>
  );
}

// ─── 메인 페이지 ────────────────────────────────

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
      if (data.length > 0 && !activeCategory) {
        setActiveCategory(data[0].slug);
      }
    });
  }, []);

  const currentCat = categories.find((c) => c.slug === activeCategory);

  useEffect(() => {
    if (!activeCategory) return;
    setLoading(true);
    getPostsByCategory(activeCategory).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, [activeCategory]);

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden bg-background">
      {/* 사이드바 */}
      <aside className="hidden md:flex w-56 border-r border-border flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Terminal className="w-4 h-4" />
            Community
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            Channels
          </p>
          {categories.map((cat) => {
            const isActive = cat.slug === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                {cat.name}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 메인 영역 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">{currentCat?.name || "Loading..."}</span>
            <span className="text-muted-foreground text-xs hidden sm:block">
              · {currentCat?.description || ""}
            </span>
          </div>
          <Button asChild size="sm" className="gap-1.5">
            <Link href={`/community/new?category=${activeCategory}`}>
              <Plus className="w-3.5 h-3.5" />새 글
            </Link>
          </Button>
        </header>

        {/* 게시물 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl border bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-3">
              <MessageSquare className="w-10 h-10 opacity-20" />
              <p className="text-sm">아직 게시물이 없습니다.</p>
              <Button asChild size="sm" variant="outline">
                <Link href={`/community/new?category=${activeCategory}`}>
                  첫 게시물 작성하기
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* 모바일 카테고리 탭 */}
        <div className="md:hidden flex border-t border-border bg-card">
          {categories.map((cat) => {
            const isActive = cat.slug === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex-1 flex flex-col items-center py-2.5 text-[10px] gap-1 transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Hash className="w-4 h-4" />
                {cat.name.slice(0, 5)}...
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
