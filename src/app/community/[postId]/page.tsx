/**
 * @file src/app/community/[postId]/page.tsx
 * @description 게시물 상세 페이지 — 내용 + 댓글.
 */
"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPostById, deletePost } from "@/lib/actions/posts";
import {
  getCommentsByPost,
  createComment,
  deleteComment,
  type CreateCommentState,
} from "@/lib/actions/comments";
import { auth } from "@/auth";

type Post = Awaited<ReturnType<typeof getPostById>>;
type Comment = Awaited<ReturnType<typeof getCommentsByPost>>[number];

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const postId = params.postId;

  const [post, setPost] = useState<Post>(null);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = async () => {
    const [p, c, session] = await Promise.all([
      getPostById(postId),
      getCommentsByPost(postId),
      auth(),
    ]);
    setPost(p);
    setCommentList(c);
    setCurrentUserId(session?.user?.id ?? null);
    setIsAdmin(session?.user?.role === "admin");
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── 댓글 폼 ──────────────────────────────────
  const boundCreateComment = createComment.bind(null, postId);
  const [commentState, commentAction, isCommentPending] = useActionState<
    CreateCommentState,
    FormData
  >(boundCreateComment, {});

  useEffect(() => {
    if (commentState.success) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentState.success]);

  const handleDeletePost = () => {
    if (!post || !confirm("이 게시물을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deletePost(
        post.id,
        post.category as
          | "gear-and-setup"
          | "track-id"
          | "terminal-info"
          | "general",
      );
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteComment(commentId, postId);
      await refresh();
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-4 animate-pulse">
        <div className="h-6 w-24 bg-muted rounded" />
        <div className="h-8 w-2/3 bg-muted rounded" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-6 text-center text-muted-foreground">
        <p>게시물을 찾을 수 없습니다.</p>
        <Link href="/community" className="text-sm underline mt-2 block">
          목록으로
        </Link>
      </div>
    );
  }

  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const author =
    post.authorName ?? post.authorEmail?.split("@")[0] ?? "Unknown";
  const canDeletePost = isAdmin || currentUserId === post.authorId;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* 헤더 */}
      <div className="space-y-1">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Community
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <h1 className="text-2xl font-semibold">{post.title}</h1>
          {canDeletePost && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeletePost}
              disabled={isPending}
              className="text-destructive hover:bg-destructive/10 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {post.category}
          </span>
          <span>·</span>
          <span>{author}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
      </div>

      {/* 본문 */}
      <div
        className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-foreground prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* 댓글 섹션 */}
      <section className="space-y-4 border-t pt-6">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          댓글 {commentList.length}개
        </h2>

        {/* 댓글 목록 */}
        {commentList.length === 0 ? (
          <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요.</p>
        ) : (
          <ul className="space-y-3">
            {commentList.map((c) => {
              const cAuthor =
                c.authorName ?? c.authorEmail?.split("@")[0] ?? "Unknown";
              const cDate = c.createdAt
                ? new Date(c.createdAt).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })
                : "—";
              const cInitials = cAuthor.slice(0, 2).toUpperCase();
              const canDelete = isAdmin || currentUserId === c.authorId;

              return (
                <li key={c.id} className="flex gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {cInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="font-medium text-foreground">
                        {cAuthor}
                      </span>
                      <span>{cDate}</span>
                    </div>
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: c.contentHtml }}
                    />
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(c.id)}
                      disabled={isPending}
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-start mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* 댓글 입력 */}
        <form action={commentAction} className="flex gap-2">
          <Input
            name="content"
            type="text"
            placeholder="댓글을 입력하세요..."
            required
            disabled={isCommentPending}
            className="flex-1"
          />
          <Button type="submit" disabled={isCommentPending} size="sm">
            등록
          </Button>
        </form>
        {commentState.error && (
          <p className="text-sm text-destructive">{commentState.error}</p>
        )}
      </section>
    </div>
  );
}
