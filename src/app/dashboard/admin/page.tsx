/**
 * @file src/app/dashboard/admin/page.tsx
 * @description Admin Dashboard — DB 연동 버전.
 * - Active Students 실제 카운트
 * - Upcoming Lessons 카운트 (Phase 2 이후 연동)
 * - Pending Feedbacks 카운트 (Phase 3 이후 연동)
 * - Student Roster: 실제 학생 목록
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UserPlus } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getStudentCount, getStudentRosterStats } from "@/lib/actions/students";
import { format } from "date-fns";
import { Settings, Trash2 } from "lucide-react";

// ─────────────────────────────────────────────────
// 통계 카드 (Suspense로 스트리밍)
// ─────────────────────────────────────────────────

async function StatsCards() {
  const count = await getStudentCount();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 rounded-lg border border-border bg-card shadow-sm hover:bg-accent/5 transition-colors">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Active Students
        </h3>
        <p className="text-3xl font-bold">{count}</p>
      </div>
      <div className="p-6 rounded-lg border border-border bg-card shadow-sm hover:bg-accent/5 transition-colors">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Pending Feedbacks
        </h3>
        <p className="text-3xl font-bold text-muted-foreground">—</p>
        <p className="text-xs text-muted-foreground mt-1">테이블에서 확인</p>
      </div>
      <div className="p-6 rounded-lg border border-border bg-card shadow-sm hover:bg-accent/5 transition-colors">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Upcoming Lessons
        </h3>
        <p className="text-3xl font-bold text-muted-foreground">—</p>
        <p className="text-xs text-muted-foreground mt-1">테이블에서 확인</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Student Roster (Table View) (Suspense로 스트리밍)
// ─────────────────────────────────────────────────

async function StudentRoster() {
  const students = await getStudentRosterStats();

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/30 text-muted-foreground space-y-3">
        <p className="text-sm">등록된 수강생이 없습니다.</p>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/admin/students/new">첫 수강생 추가하기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
          <tr>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Current Module</th>
            <th className="px-4 py-3">Next Lesson</th>
            <th className="px-4 py-3 text-center">Pending Feedbacks</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {students.map((st) => (
            <tr key={st.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {st.displayName?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {st.displayName || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {st.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {st.currentModule}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {st.nextLessonDate ? format(st.nextLessonDate, "MMM d, h:mm a") : "미정"}
              </td>
              <td className="px-4 py-3 text-center">
                {st.pendingFeedbackCount > 0 ? (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {st.pendingFeedbackCount}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Button asChild variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs">
                  <Link href={`/dashboard/admin/students/${st.id}`}>
                    <Settings className="w-3.5 h-3.5" /> Manage
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 로딩 스켈레톤
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-lg border border-border bg-card animate-pulse"
        >
          <div className="h-3 w-24 bg-muted rounded mb-4" />
          <div className="h-8 w-12 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

function RosterSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-lg border border-border bg-card animate-pulse"
        />
      ))}
    </div>
  );
}

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
