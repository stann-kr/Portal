/**
 * @file src/app/dashboard/student/page.tsx
 * @description Student Dashboard — DB 연동 버전.
 * - 현재 진행 중인 모듈 (미완료 중 최소 주차)
 * - 다음 예정 레슨
 * - 최근 피드백 (Phase 3 이후 연동)
 */
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { PlayCircle, CalendarDays, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentModule, getCurriculumByStudent } from "@/lib/actions/curriculum";
import { getNextLesson } from "@/lib/actions/lessons";
import { ProgressCharts } from "@/components/dashboard/ProgressCharts";

// ─────────────────────────────────────────────────
// 현재 모듈 섹션 (시각화 포함)
// ─────────────────────────────────────────────────

async function DashboardOverview({ studentId, displayName }: { studentId: string; displayName: string }) {
  const allModules = await getCurriculumByStudent(studentId);
  const completedCount = allModules.filter((m: { isCompleted: boolean }) => m.isCompleted).length;
  const totalCount = allModules.length;
  
  const currentMod = await getCurrentModule(studentId);

  return (
    <div className="space-y-8">
      {/* 1. 시각화 차트 및 요약 */}
      <ProgressCharts 
        completedCount={completedCount} 
        totalCount={totalCount} 
        displayName={displayName} 
      />

      {/* 2. 현재 진행 중인 모듈 숏컷 */}
      {currentMod && (
        <section className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Next Activity
            </h2>
            <Link href="/dashboard/student/curriculum" className="text-xs text-primary hover:underline">
              전체 커리큘럼 보기
            </Link>
          </div>
          <div className="flex items-center justify-between p-6 rounded-xl border border-primary/20 bg-primary/5">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                WEEK {String(currentMod.weekNum).padStart(2, "0")}
              </p>
              <h3 className="font-medium text-foreground text-lg">{currentMod.title}</h3>
            </div>
            <Button asChild variant="default" className="gap-2">
              <Link href="/dashboard/student/curriculum">
                <PlayCircle className="w-4 h-4" />
                Resume
              </Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// 다음 레슨 섹션
// ─────────────────────────────────────────────────

async function NextLessonSection({ studentId }: { studentId: string }) {
  const lesson = await getNextLesson(studentId);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/10 text-muted-foreground">
        <p className="text-sm">예정된 레슨이 없습니다.</p>
      </div>
    );
  }

  const date = new Date(lesson.scheduledAt!);
  const month = date
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const day = date.getDate();
  const time = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // .ics 다운로드 링크
  const icsUrl = `/api/calendar/${studentId}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-md bg-muted flex flex-col items-center justify-center border border-border flex-shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground">
            {month}
          </span>
          <span className="text-2xl font-bold">{day}</span>
        </div>
        <div className="space-y-0.5 flex-1">
          <p className="font-semibold text-foreground">1:1 Feedback Session</p>
          <p className="text-sm text-muted-foreground">
            {time} KST / Online Studio
          </p>
        </div>
        <a href={icsUrl} download>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <CalendarDays className="w-3 h-3" />
            .ics
          </Button>
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// 스켈레톤
// ─────────────────────────────────────────────────

function ModuleSkeleton() {
  return <div className="h-24 rounded-lg border bg-muted animate-pulse" />;
}
function LessonSkeleton() {
  return <div className="h-16 rounded-lg bg-muted animate-pulse" />;
}

// ─────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────

export default async function StudentDashboard() {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== "student") {
    redirect("/dashboard/admin");
  }

  const studentId = session!.user!.id!;

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6">
      {/* 헤더 */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            Personal Portal
            <span className="text-muted-foreground font-normal">/ Student</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your progress and upcoming lessons.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard/student/notes">
            <BookOpen className="w-4 h-4" />
            1:1 수업 노트
          </Link>
        </Button>
      </header>

      {/* 대시보드 오버뷰 (차트 + 현재 모듈) */}
      <Suspense fallback={<ModuleSkeleton />}>
        <DashboardOverview 
          studentId={studentId} 
          displayName={session?.user?.name || ""} 
        />
      </Suspense>

      {/* 하단 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 다음 레슨 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Next Lesson
          </h3>
          <Suspense fallback={<LessonSkeleton />}>
            <NextLessonSection studentId={studentId} />
          </Suspense>
        </div>

        {/* 최근 피드백 (Phase 3 이후 연동) */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Feedback
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/10 text-muted-foreground">
            <p className="text-sm italic">No active feedback requests.</p>
            <p className="text-xs mt-1 text-muted-foreground/50">
              Phase 3에서 연동 예정
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
