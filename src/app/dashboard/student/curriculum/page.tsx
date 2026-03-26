/**
 * @file src/app/dashboard/student/curriculum/page.tsx
 * @description 원페이지 포털로 통합됨 — /dashboard/student 리다이렉트.
 */
import { redirect } from "next/navigation";

export default function CurriculumRedirectPage() {
  redirect("/dashboard/student");
}
