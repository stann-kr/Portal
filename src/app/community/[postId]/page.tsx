/**
 * @file src/app/community/[postId]/page.tsx
 * @description 게시물 상세 페이지 — 내용 + 댓글.
 * Server Component로 분리하여 auth 및 db 호출을 서버 측에서 안전하게 수행.
 */
import Link from "next/link";
import { getPostById } from "@/lib/actions/posts";
import { getCommentsByPost } from "@/lib/actions/comments";
import { auth } from "@/auth";
import { PostDetailClient } from "./PostDetailClient";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  const [post, commentList, session] = await Promise.all([
    getPostById(postId),
    getCommentsByPost(postId),
    auth(),
  ]);

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

  const currentUserId = session?.user?.id ?? null;
  const isAdmin = session?.user?.role === "admin";

  return (
    <PostDetailClient
      postId={postId}
      post={post}
      initialCommentList={commentList}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
}
