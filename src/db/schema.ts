import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  role: text("role").default("student").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const curriculums = sqliteTable("curriculums", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  weekNum: integer("week_num").notNull(),
  title: text("title").notNull(),
  isCompleted: integer("is_completed", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
  googleEventId: text("google_event_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const assignments = sqliteTable("assignments", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  mediaUrl: text("media_url").notNull(),
  submittedAt: integer("submitted_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const feedbacks = sqliteTable("feedbacks", {
  id: text("id").primaryKey(),
  assignmentId: text("assignment_id")
    .references(() => assignments.id, { onDelete: "cascade" })
    .notNull(),
  timeMarker: integer("time_marker").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const privateNotes = sqliteTable("private_notes", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  authorId: text("author_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  contentHtml: text("content_html").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

/**
 * Phase 3: boardType으로 게시판 유형 분리.
 * - ANNOUNCEMENT: 공지 (Admin 전용 작성, 아코디언 UI)
 * - GENERAL: 자유 게시판 (카테고리별 스레드)
 * - FEEDBACK: 믹스셋 공유 (R2 오디오 업로드 + 인라인 플레이어)
 * category 컬럼은 GENERAL 타입 하위 분류용으로 유지.
 */
export type BoardType = "ANNOUNCEMENT" | "GENERAL" | "FEEDBACK";

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  authorId: text("author_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  contentHtml: text("content_html").notNull(),
  // Phase 3 추가 컬럼
  boardType: text("board_type")
    .$type<BoardType>()
    .default("GENERAL")
    .notNull(),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false).notNull(),
  mediaUrl: text("media_url"), // FEEDBACK 타입 R2 오디오 URL
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  authorId: text("author_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  contentHtml: text("content_html").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

