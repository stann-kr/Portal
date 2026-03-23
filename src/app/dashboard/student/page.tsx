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
import { PlayCircle, CalendarDays, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentModule } from "@/lib/actions/curriculum";
import { getNextLesson } from "@/lib/actions/lessons";

// ─────────────────────────────────────────────────
// 현재 모듈 섹션
// ─────────────────────────────────────────────────

async function CurrentModuleSection({ studentId }: { studentId: string }) {
  const mod = await getCurrentModule(studentId);

  if (!mod) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed bg-muted/20 text-muted-foreground space-y-2">
        <p className="text-sm">모든 커리큘럼을 완료했습니다! 🎉</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-6 rounded-lg border bg-muted/20">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          WEEK {String(mod.weekNum).padStart(2, "0")}
        </p>
        <h3 className="font-medium text-foreground text-lg">{mod.title}</h3>
      </div>
      <Button asChild variant="default" className="gap-2">
        <Link href="/dashboard/student/curriculum">
          <PlayCircle className="w-4 h-4" />
          Resume
        </Link>
      </Button>
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
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          Personal Portal
          <span className="text-muted-foreground font-normal">/ Student</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your progress and upcoming lessons.
        </p>
      </header>

      {/* 현재 모듈 */}
      <section className="p-8 rounded-xl border border-border bg-card shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            Current Module
          </h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground"
          >
            <Link href="/dashboard/student/curriculum">
              전체 보기
              <ChevronRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
        <Suspense fallback={<ModuleSkeleton />}>
          <CurrentModuleSection studentId={studentId} />
        </Suspense>
      </section>

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
