/**
 * @file src/app/dashboard/admin/page.tsx
 * @description Admin Dashboard — DB 연동 버전.
 * 하위 컴포넌트들을 분리하여 관심사 제어.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UserPlus } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { StatsCards, StatsSkeleton } from "@/components/admin/StatsCards";
import { StudentRoster, RosterSkeleton } from "@/components/admin/StudentRoster";

// ─────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────

export default async function AdminDashboard() {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== "admin") {
    redirect("/dashboard/student");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6">
      {/* 헤더 */}
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            Dashboard
            <span className="text-muted-foreground font-normal">/ Admin</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your students and lesson schedules.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/admin/students/new">
            <UserPlus className="w-4 h-4" />
            수강생 추가
          </Link>
        </Button>
      </header>

      {/* 통계 카드 */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards />
      </Suspense>

      {/* Student Roster */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold">Student Roster</h2>
        </div>
        <Suspense fallback={<RosterSkeleton />}>
          <StudentRoster />
        </Suspense>
      </section>
    </div>
  );
}
