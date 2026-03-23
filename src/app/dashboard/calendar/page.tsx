/**
 * @file src/app/dashboard/calendar/page.tsx
 * @description 통합 수업 및 과제 관리 캘린더 페이지.
 * dayjs를 사용하여 커스텀 캘린더 UI를 구현하고, 레슨 및 과제 일정을 시각화함.
 */
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createDb } from "@/db/client";
import { lessons, assignments } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id!;
  const role = session.user.role;

  // 이번 달 데이터 가져오기 (간소화를 위해 현재 날짜 기준 한 달치)
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const db = createDb();
  
  // 레슨 및 과제 데이터 조회
  const myLessons = await db
    .select()
    .from(lessons)
    .where(
      role === "admin" 
        ? and(gte(lessons.scheduledAt, firstDay), lte(lessons.scheduledAt, lastDay))
        : and(
            eq(lessons.studentId, userId),
            gte(lessons.scheduledAt, firstDay),
            lte(lessons.scheduledAt, lastDay)
          )
    );

  const myAssignments = await db
    .select()
    .from(assignments)
    .where(
      role === "admin"
        ? and(gte(assignments.submittedAt, firstDay), lte(assignments.submittedAt, lastDay))
        : and(
            eq(assignments.studentId, userId),
            gte(assignments.submittedAt, firstDay),
            lte(assignments.submittedAt, lastDay)
          )
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Class Calendar
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
            {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="px-4">
            Today
          </Button>
          <Button variant="outline" size="icon" disabled>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 캘린더 그리드 (데스크톱 전용 상세 뷰) */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-tighter">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {/* 날짜 칸 채우기 (로직 간소화: 이번 달만 표시) */}
          {Array.from({ length: 35 }).map((_, i) => {
            const dayNum = i - firstDay.getDay() + 1;
            const isToday = dayNum === now.getDate();
            const isValid = dayNum > 0 && dayNum <= lastDay.getDate();

            if (!isValid) return <div key={i} className="min-h-[120px] border-b border-r border-border bg-muted/5 opacity-30" />;

            const dayDate = new Date(now.getFullYear(), now.getMonth(), dayNum);
            const dayLessons = myLessons.filter((l: any) => l.scheduledAt.toDateString() === dayDate.toDateString());
            const dayAssignments = myAssignments.filter((a: any) => a.submittedAt?.toDateString() === dayDate.toDateString());

            return (
              <div key={i} className={`min-h-[120px] p-2 border-b border-r border-border transition-colors hover:bg-muted/10 ${isToday ? "bg-primary/5" : ""}`}>
                <span className={`text-sm font-medium ${isToday ? "text-primary font-bold bg-primary/10 px-2 py-1 rounded-full" : "text-muted-foreground"}`}>
                  {dayNum}
                </span>
                
                <div className="mt-2 space-y-1">
                  {dayLessons.map((lesson: any) => (
                    <div key={lesson.id} className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-600 border border-blue-200 dark:border-blue-900 truncate font-medium">
                      🕒 Lesson: {lesson.scheduledAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  ))}
                  {dayAssignments.map((asgn: any) => (
                    <div key={asgn.id} className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-600 border border-green-200 dark:border-green-900 truncate font-medium">
                      🎥 Submitted Mix
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6 p-4 rounded-xl border border-border bg-muted/20">
        <p className="text-xs font-bold text-muted-foreground uppercase">Legend:</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/10 border border-blue-200" />
          <span className="text-xs text-muted-foreground">Lessons</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/10 border border-green-200" />
          <span className="text-xs text-muted-foreground">Assignments</span>
        </div>
      </div>
    </div>
  );
}
