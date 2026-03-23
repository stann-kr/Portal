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

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  authorId: text("author_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  category: text("category").notNull(), /* TODO: nullable로 만들고 categoryId 포워딩 후 제거 고려. 일단 유지하며 기존 코드 폭파 방지 */
  title: text("title").notNull(),
  contentHtml: text("content_html").notNull(),
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

