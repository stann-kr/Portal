/**
 * @file src/components/qna/ThreadList.tsx
 * @description Q&A 스레드 목록 — 상태 뱃지 + 학생명(어드민 뷰).
 */
import Link from "next/link";
import { MessageCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { QnaStatus } from "@/db/schema";

const STATUS_CONFIG: Record<
  QnaStatus,
  { label: string; color: string; Icon: React.ElementType }
> = {
  OPEN: { label: "미답변", color: "bg-red-500/10 text-red-500", Icon: Clock },
  ANSWERED: { label: "답변완료", color: "bg-green-500/10 text-green-500", Icon: CheckCircle2 },
  CLOSED: { label: "종료", color: "bg-muted text-muted-foreground", Icon: XCircle },
};

type Thread = {
  id: string;
  title: string;
  status: QnaStatus;
  createdAt: Date | null | undefined;
  studentName: string | null | undefined;
  studentEmail: string | null | undefined;
};

interface ThreadListProps {
  threads: Thread[];
  isAdmin: boolean;
}

export function ThreadList({ threads, isAdmin }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <MessageCircle className="w-10 h-10 opacity-20" />
        <p className="text-sm">
          {isAdmin ? "아직 질문이 없습니다." : "아직 등록한 질문이 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => {
        const { label, color, Icon } = STATUS_CONFIG[thread.status];
        const date = thread.createdAt
          ? new Date(thread.createdAt).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
            })
          : "—";
        const student =
          thread.studentName ?? thread.studentEmail?.split("@")[0] ?? "—";

        return (
          <Link
            key={thread.id}
            href={`/dashboard/qna/${thread.id}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors group"
          >
            <Icon
              className={`w-4 h-4 flex-shrink-0 ${
                thread.status === "OPEN"
                  ? "text-red-500"
                  : thread.status === "ANSWERED"
                  ? "text-green-500"
                  : "text-muted-foreground"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{thread.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {isAdmin && (
                  <span className="text-xs text-muted-foreground">{student} ·</span>
                )}
                <span className="text-xs text-muted-foreground">{date}</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${color}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
