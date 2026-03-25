/**
 * @file src/components/dashboard/UpcomingLessonsWidget.tsx
 * @description 학생 대시보드 — 임박 레슨 D-day 알림 위젯 (Server Component).
 * 다음 레슨까지 남은 일수를 D-day 뱃지로 표시.
 */
import { CalendarDays, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNextLesson } from "@/lib/actions/lessons";

interface UpcomingLessonsWidgetProps {
  studentId: string;
}

function getDDayLabel(scheduledAt: Date): { label: string; urgent: boolean } {
  const now = new Date();
  const diff = Math.ceil(
    (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff < 0) return { label: "지남", urgent: false };
  if (diff === 0) return { label: "D-DAY", urgent: true };
  if (diff <= 3) return { label: `D-${diff}`, urgent: true };
  return { label: `D-${diff}`, urgent: false };
}

export async function UpcomingLessonsWidget({
  studentId,
}: UpcomingLessonsWidgetProps) {
  const lesson = await getNextLesson(studentId);

  if (!lesson || !lesson.scheduledAt) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Upcoming Lesson
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground py-6">
          <CalendarDays className="w-8 h-8 opacity-20" />
          <p className="text-sm">예정된 레슨 없음</p>
        </div>
      </div>
    );
  }

  const date = new Date(lesson.scheduledAt);
  const { label: ddayLabel, urgent } = getDDayLabel(date);
  const icsUrl = `/api/calendar/${studentId}`;

  const month = date
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const day = date.getDate();
  const weekday = date.toLocaleDateString("ko-KR", { weekday: "long" });
  const time = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Upcoming Lesson
          </h3>
        </div>
        {/* D-day 뱃지 */}
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider flex items-center gap-1 ${
            urgent
              ? "bg-red-500/10 text-red-500"
              : "bg-primary/10 text-primary"
          }`}
        >
          {urgent && <AlertCircle className="w-3 h-3" />}
          {ddayLabel}
        </span>
      </div>

      {/* 날짜 카드 */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-muted border border-border flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground">
            {month}
          </span>
          <span className="text-2xl font-bold leading-none">{day}</span>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">1:1 Feedback Session</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {weekday} {time} KST
          </p>
          <p className="text-xs text-muted-foreground">Online Studio</p>
        </div>
      </div>

      {/* .ics 다운로드 */}
      <a href={icsUrl} download className="mt-auto">
        <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
          <CalendarDays className="w-3.5 h-3.5" />
          캘린더에 추가 (.ics)
        </Button>
      </a>
    </div>
  );
}

export function UpcomingLessonsWidgetSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm animate-pulse space-y-4">
      <div className="h-3 w-32 bg-muted rounded" />
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-xl bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="h-8 bg-muted rounded" />
    </div>
  );
}
