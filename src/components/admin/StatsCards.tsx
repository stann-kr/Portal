/**
 * @file src/components/admin/StatsCards.tsx
 * @description 관리자 대시보드의 통계 카드 컴포넌트 및 스켈레톤 UI.
 */
import { getStudentCount } from "@/lib/actions/students";

export async function StatsCards() {
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

export function StatsSkeleton() {
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
