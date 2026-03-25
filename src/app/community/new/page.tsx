/**
 * @file src/app/community/new/page.tsx
 * @description 게시물 작성 페이지.
 * TiptapEditor로 리치 텍스트 작성, 카테고리 선택, FormData 제출.
 */
"use client";

import { useActionState, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPost, type CreatePostState } from "@/lib/actions/posts";
import TiptapEditor from "@/components/community/TiptapEditor";


import { getCategories } from "@/lib/actions/categories";

function NewPostForm() {
  const searchParams = useSearchParams();
  const defaultCategory = searchParams?.get("category") ?? "general";

  const [state, action, isPending] = useActionState<CreatePostState, FormData>(
    createPost,
    {},
  );

  const [contentHtml, setContentHtml] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* 헤더 */}
      <div className="space-y-1">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Community
        </Link>
        <h1 className="text-2xl font-semibold mt-2">새 게시물</h1>
      </div>

      {/* 폼 */}
      <form action={action} className="space-y-5">
        {/* 에러 */}
        {state?.error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {/* 카테고리 */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">채널</label>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <label key={cat.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={cat.slug}
                  defaultChecked={cat.slug === defaultCategory}
                  className="sr-only peer"
                  disabled={isPending}
                />
                <span className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground peer-checked:border-foreground peer-checked:text-foreground peer-checked:font-medium transition-colors hover:border-foreground/50">
                  # {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium">
            제목 <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            name="title"
            type="text"
            placeholder="게시물 제목"
            required
            disabled={isPending}
          />
        </div>

        {/* 내용 (TiptapEditor) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            내용 <span className="text-destructive">*</span>
          </label>
          {/* Hidden input for FormData */}
          <input type="hidden" name="contentHtml" value={contentHtml} />
          <div className="rounded-xl border border-border overflow-hidden">
            <TiptapEditor onSubmit={(html) => setContentHtml(html)} />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 flex-1"
            onClick={() => {
              // TiptapEditor의 현재 contentHtml을 hidden input에 반영
            }}
          >
            <Send className="w-4 h-4" />
            {isPending ? "게시 중..." : "게시하기"}
          </Button>
          <Button variant="outline" asChild disabled={isPending}>
            <Link href="/community">취소</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto py-6 space-y-6 text-center text-muted-foreground">로딩 중...</div>}>
      <NewPostForm />
    </Suspense>
  );
}
