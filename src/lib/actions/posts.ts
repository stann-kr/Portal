/**
 * @file src/lib/actions/posts.ts
 * @description 커뮤니티 게시물 CRUD 서버 액션.
 * 작성: 모든 인증 사용자.
 * 수정/삭제: 본인 글만.
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createDb } from "@/db/client";
import { posts, profiles } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";

const VALID_CATEGORIES = [
  "gear-and-setup",
  "track-id",
  "terminal-info",
  "general",
] as const;
type Category = (typeof VALID_CATEGORIES)[number];

async function requireAuth() {
  const session = await auth();
  console.log("[posts] Checking auth session. User ID exists:", !!session?.user?.id);
  if (!session?.user?.id) {
    console.warn("[posts] Authorization failed: Session or User ID missing");
    throw new Error("Unauthorized");
  }
  return session;
}

// ───────────────────────────────────────────────
// 조회
// ───────────────────────────────────────────────

/**
 * 카테고리별 게시물 목록 조회 (최신순, 작성자 정보 포함).
 */
export async function getPostsByCategory(category: Category) {
  const db = createDb();
  return db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      category: posts.category,
      title: posts.title,
      contentHtml: posts.contentHtml,
      createdAt: posts.createdAt,
      authorName: profiles.displayName,
      authorEmail: profiles.email,
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(posts.category, category))
    .orderBy(desc(posts.createdAt));
}

/**
 * 게시물 단건 조회 (작성자 정보 포함).
 */
export async function getPostById(postId: string) {
  const db = createDb();
  const rows = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      category: posts.category,
      title: posts.title,
      contentHtml: posts.contentHtml,
      createdAt: posts.createdAt,
      authorName: profiles.displayName,
      authorEmail: profiles.email,
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(posts.id, postId))
    .limit(1);
  return rows[0] ?? null;
}

// ───────────────────────────────────────────────
// 생성
// ───────────────────────────────────────────────

export type CreatePostState = { error?: string };

/**
 * 게시물 작성.
 * @param _prev - useActionState 이전 상태
 * @param formData - { title, category, contentHtml }
 */
export async function createPost(
  _prev: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  const session = await requireAuth();

  const title = (formData.get("title") as string)?.trim();
  const category = formData.get("category") as string;
  const contentHtml = formData.get("contentHtml") as string;

  if (!title) return { error: "제목을 입력해주세요." };
  if (!VALID_CATEGORIES.includes(category as Category))
    return { error: "유효하지 않은 카테고리입니다." };
  if (!contentHtml || contentHtml === "<p></p>")
    return { error: "내용을 입력해주세요." };

  const db = createDb();
  const id = crypto.randomUUID();

  await db.insert(posts).values({
    id,
    authorId: session.user.id!,
    category,
    title,
    contentHtml,
  });

  revalidatePath("/community");
  redirect(`/community/${id}`);
}

// ───────────────────────────────────────────────
// 삭제 (본인 글만)
// ───────────────────────────────────────────────

/**
 * 게시물 삭제 (본인 글 또는 Admin).
 */
export async function deletePost(postId: string, category: Category) {
  const session = await requireAuth();
  const db = createDb();

  const condition =
    session.user.role === "admin"
      ? eq(posts.id, postId)
      : and(eq(posts.id, postId), eq(posts.authorId, session.user.id!));

  await db.delete(posts).where(condition);
  revalidatePath("/community");
  redirect(`/community?category=${category}`);
}
