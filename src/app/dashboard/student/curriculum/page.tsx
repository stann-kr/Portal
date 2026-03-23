/**
 * @file src/app/dashboard/student/curriculum/page.tsx
 * @description 전체 커리큘럼 목록 페이지 (Student 전용).
 * 주차별 모듈 목록과 완료 여부를 표시. 완료 토글 기능.
 */
"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Circle, BookOpen } from "lucide-react";
import {
  getMyCurriculum,
  toggleModuleComplete,
} from "@/lib/actions/curriculum";

type Module = Awaited<ReturnType<typeof getMyCurriculum>>[number];

export default function CurriculumPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = async () => {
    const data = await getMyCurriculum();
    setModules(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleModuleComplete(id, current);
      await refresh();
    });
  };

  const completed = modules.filter((m) => m.isCompleted).length;
  const total = modules.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* 헤더 */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
          My Curriculum
        </h1>
        <p className="text-sm text-muted-foreground">
          전체 학습 커리큘럼 및 진행 현황
        </p>
      </header>

      {/* 진행률 바 */}
      {total > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completed} / {total} 완료
            </span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 모듈 목록 */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-lg border bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/20 text-muted-foreground">
          <p className="text-sm">아직 등록된 커리큘럼이 없습니다.</p>
          <p className="text-xs mt-1">강사에게 문의하세요.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {modules.map((m) => (
            <li
              key={m.id}
              className={`flex items-center gap-4 p-4 rounded-xl border border-border bg-card transition-colors ${
                m.isCompleted ? "opacity-60" : "hover:bg-accent/5"
              }`}
            >
              <button
                onClick={() => handleToggle(m.id, m.isCompleted)}
                disabled={isPending}
                className="flex-shrink-0 transition-transform hover:scale-110"
                aria-label={m.isCompleted ? "미완료로 변경" : "완료로 변경"}
              >
                {m.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    WEEK {String(m.weekNum).padStart(2, "0")}
                  </span>
                </div>
                <p
                  className={`font-medium mt-0.5 ${m.isCompleted ? "line-through" : ""}`}
                >
                  {m.title}
                </p>
              </div>

              {m.isCompleted && (
                <span className="text-xs text-green-500 font-medium flex-shrink-0">
                  완료
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
