/**
 * @file src/components/dashboard/ProfileCourseWidget.tsx
 * @description 학생 대시보드 — 프로필 + 수강 과정 요약 위젯.
 * 이름, 역할 뱃지, 전체 진도 요약 카드.
 */
import { Award, TrendingUp } from "lucide-react";

interface ProfileCourseWidgetProps {
  displayName: string;
  email: string;
  completedCount: number;
  totalCount: number;
}

export function ProfileCourseWidget({
  displayName,
  email,
  completedCount,
  totalCount,
}: ProfileCourseWidgetProps) {
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email[0]?.toUpperCase() ?? "?";

  const tier =
    percentage >= 90
      ? { label: "Elite Producer", color: "text-yellow-500 bg-yellow-500/10" }
      : percentage >= 50
        ? { label: "Rising Artist", color: "text-blue-500 bg-blue-500/10" }
        : { label: "Lumo Scholar", color: "text-primary bg-primary/10" };

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-5">
      {/* 아바타 + 이름 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-primary">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">
            {displayName || "Student"}
          </p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
      </div>

      {/* 티어 뱃지 */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${tier.color}`}
        >
          <Award className="w-3 h-3" />
          {tier.label}
        </span>
      </div>

      {/* 진도 바 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Course Progress
          </span>
          <span className="font-semibold text-foreground">{percentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {completedCount} / {totalCount} 모듈 완료
        </p>
      </div>
    </div>
  );
}
