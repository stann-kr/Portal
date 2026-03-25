/**
 * @file src/app/dashboard/student/page.tsx
 * @description 학생 대시보드 홈 — Phase 2 고도화 버전.
 * 3컬럼 위젯 그리드 레이아웃 (반응형: 모바일 1컬럼, 태블릿 2컬럼, 데스크탑 3컬럼).
 * 각 위젯은 독립적인 Suspense 경계로 병렬 스트리밍.
 */
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  getCurriculumByStudent,
  getCurrentModule,
} from "@/lib/actions/curriculum";
import { ProgressCharts } from "@/components/dashboard/ProgressCharts";
import { ProfileCourseWidget } from "@/components/dashboard/ProfileCourseWidget";
import {
  UpcomingLessonsWidget,
  UpcomingLessonsWidgetSkeleton,
} from "@/components/dashboard/UpcomingLessonsWidget";
import { DiggingAnalyticsWidget } from "@/components/dashboard/DiggingAnalyticsWidget";
import { PendingQnaWidget } from "@/components/dashboard/PendingQnaWidget";

// ─── 현재 모듈 숏컷 ──────────────────────────────

async function CurrentModuleCard({ studentId }: { studentId: string }) {
  const currentMod = await getCurrentModule(studentId);
  if (!currentMod) return null;

  return (
    <div className="flex items-center justify-between p-5 rounded-xl border border-primary/20 bg-primary/5">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
          WEEK {String(currentMod.weekNum).padStart(2, "0")}
        </p>
        <h3 className="font-semibold text-foreground">{currentMod.title}</h3>
      </div>
      <Button
        asChild
        variant="default"
        size="sm"
        className="gap-2 flex-shrink-0"
      >
        <Link href="/dashboard/student/curriculum">
          <PlayCircle className="w-4 h-4" />
          Resume
        </Link>
      </Button>
    </div>
  );
}

// ─── 진행률 + 스파크라인 섹션 ───────────────────

async function ProgressSection({
  studentId,
  displayName,
}: {
  studentId: string;
  displayName: string;
}) {
  const allModules = await getCurriculumByStudent(studentId);
  const completedCount = allModules.filter(
    (m: { isCompleted: boolean }) => m.isCompleted,
  ).length;

  return (
    <ProgressCharts
      completedCount={completedCount}
      totalCount={allModules.length}
      displayName={displayName}
    />
  );
}

// ─── 프로필 섹션 ─────────────────────────────────

async function ProfileSection({
  studentId,
  displayName,
  email,
}: {
  studentId: string;
  displayName: string;
  email: string;
}) {
  const allModules = await getCurriculumByStudent(studentId);
  const completedCount = allModules.filter(
    (m: { isCompleted: boolean }) => m.isCompleted,
  ).length;

  return (
    <ProfileCourseWidget
      displayName={displayName}
      email={email}
      completedCount={completedCount}
      totalCount={allModules.length}
    />
  );
}

// ─── 스켈레톤 ────────────────────────────────────

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card animate-pulse ${className}`}
    />
  );
}

// ─── 메인 페이지 ─────────────────────────────────

export default async function StudentDashboard() {
  const session = await auth();
  if (session?.user?.role !== "student") redirect("/dashboard/admin");

  const studentId = session.user.id!;
  const displayName = session.user.name || "";
  const email = session.user.email || "";

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6">
      {/* 헤더 */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Personal Portal
            <span className="text-muted-foreground font-normal">
              {" "}
              / Student
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your progress and upcoming lessons.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-2 self-start sm:self-auto"
        >
          <Link href="/dashboard/student/notes">
            <BookOpen className="w-4 h-4" />
            1:1 수업 노트
          </Link>
        </Button>
      </header>

      {/* 현재 모듈 숏컷 */}
      <Suspense fallback={<CardSkeleton className="h-20" />}>
        <CurrentModuleCard studentId={studentId} />
      </Suspense>

      {/* 1행: 프로필 + 진행률 + 임박 레슨 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Suspense fallback={<CardSkeleton className="h-52" />}>
          <ProfileSection
            studentId={studentId}
            displayName={displayName}
            email={email}
          />
        </Suspense>

        <Suspense fallback={<CardSkeleton className="h-52" />}>
          <ProgressSection studentId={studentId} displayName={displayName} />
        </Suspense>

        <Suspense fallback={<UpcomingLessonsWidgetSkeleton />}>
          <UpcomingLessonsWidget studentId={studentId} />
        </Suspense>
      </div>

      {/* 2행: 디깅 애널리틱스 + Q&A + 최근 피드백 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recharts 바 차트, 목데이터 */}
        <DiggingAnalyticsWidget />

        {/* Q&A 알림, 목데이터 */}
        <PendingQnaWidget />

        {/* 최근 피드백 — Phase 3 이후 연동 */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Feedback
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center py-8 border border-dashed rounded-xl bg-muted/10 text-muted-foreground gap-2">
            <p className="text-sm">No active feedback requests.</p>
            <p className="text-xs opacity-50">Phase 3에서 연동 예정</p>
          </div>
        </div>
      </div>
    </div>
  );
}
