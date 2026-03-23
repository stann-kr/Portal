/**
 * @file src/lib/actions/categories.ts
 * @description 커뮤니티 카테고리 관리를 위한 서버 액션 (Admin 전용)
 */
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createDb } from "@/db/client";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin only.");
  }
}

export async function getCategories() {
  const db = createDb();
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export type CategoryState = { error?: string; success?: boolean };

export async function createCategory(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  await requireAdmin();
  const slug = formData.get("slug") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);

  if (!slug || !name) return { error: "Slug와 Name은 필수입니다." };

  const db = createDb();
  const id = crypto.randomUUID();

  try {
    await db.insert(categories).values({
      id,
      slug,
      name,
      description,
      sortOrder,
    });
    revalidatePath("/dashboard/admin/categories");
    revalidatePath("/community");
    return { success: true };
  } catch (err: any) {
    if (err.message?.includes("UNIQUE constraint failed")) {
      return { error: "이미 존재하는 Slug입니다." };
    }
    return { error: "카테고리 생성 중 오류가 발생했습니다." };
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const db = createDb();
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/dashboard/admin/categories");
  revalidatePath("/community");
}
