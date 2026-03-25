/**
 * @file src/components/dashboard/PendingQnaWidget.tsx
 * @description 학생 대시보드 — Q&A 알림 위젯.
 * Phase 6 (Q&A 게시판) 완료 전까지 목데이터로 UI 미리 표시.
 * 미답변 스레드 수와 최근 질문 목록 표시.
 */
import Link from "next/link";
import { MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Phase 6 완료 후 실제 DB 조회로 교체 예정
const MOCK_THREADS = [
  {
    id: "1",
    title: "킥 레이어링 시 주파수 충돌 해결 방법",
    status: "OPEN" as const,
    createdAt: "2일 전",
  },
  {
    id: "2",
    title: "Ableton Rack vs Chain 선택 기준",
    status: "ANSWERED" as const,
    createdAt: "5일 전",
  },
];
const MOCK_OPEN_COUNT = MOCK_THREADS.filter((t) => t.status === "OPEN").length;

const STATUS_CONFIG = {
  OPEN: { label: "미답변", color: "bg-red-500/10 text-red-500" },
  ANSWERED: { label: "답변 완료", color: "bg-green-500/10 text-green-500" },
  CLOSED: { label: "종료", color: "bg-muted text-muted-foreground" },
};

export function PendingQnaWidget() {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Q&A
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {MOCK_OPEN_COUNT > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {MOCK_OPEN_COUNT}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/60 italic">
            Phase 6 preview
          </span>
        </div>
      </div>

      {/* 스레드 목록 */}
      <div className="space-y-2">
        {MOCK_THREADS.map((thread) => {
          const config = STATUS_CONFIG[thread.status];
          return (
            <div
              key={thread.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {thread.status === "ANSWERED" ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {thread.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.color}`}
                  >
                    {config.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {thread.createdAt}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 새 질문 버튼 (Phase 6 이후 활성화) */}
      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-full gap-2 text-xs mt-auto"
        disabled
      >
        <Link href="/dashboard/qna/new">
          <MessageCircle className="w-3.5 h-3.5" />
          새 질문 작성 (Phase 6 오픈 예정)
        </Link>
      </Button>
    </div>
  );
}
