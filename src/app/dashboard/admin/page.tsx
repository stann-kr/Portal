/**
 * @file src/app/dashboard/admin/page.tsx
 * @description 관리자 대시보드 홈 — Phase 2 고도화 버전.
 * 3개 통계 카드 (수강생/이번주레슨/미답변피드백) + 수강생 로스터 테이블.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UserPlus, BarChart3 } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { StatsCards, StatsSkeleton } from "@/components/admin/StatsCards";
import { StudentRoster, RosterSkeleton } from "@/components/admin/StudentRoster";

export default async function AdminDashboard() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard/student");

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6">
      {/* 헤더 */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Dashboard
              <span className="text-muted-foreground font-normal">
                {" "}
                / Admin
              </span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your students and lesson schedules.
          </p>
        </div>
        <Button asChild className="gap-2 self-start sm:self-auto">
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
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-base font-semibold text-foreground">
            Student Roster
          </h2>
          <p className="text-xs text-muted-foreground">
            전체 수강생 관리
          </p>
        </div>
        <Suspense fallback={<RosterSkeleton />}>
          <StudentRoster />
        </Suspense>
      </section>
    </div>
  );
}
