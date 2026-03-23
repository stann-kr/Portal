/**
 * @file src/components/feedback/TimelineFeedback.tsx
 * @description 타임스탬프 기반 피드백 UI 컴포넌트.
 * - 타임스탬프 클릭 시 VideoPlayer의 해당 시점으로 이동
 * - Admin: 피드백 작성 폼 노출
 * - Student: 조회만 가능
 */
"use client";

import { useActionState, useEffect, useTransition } from "react";
import { MessageSquare, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/lib/utils/format";
import {
  createFeedback,
  deleteFeedback,
  type CreateFeedbackState,
} from "@/lib/actions/feedbacks";

export interface FeedbackItem {
  id: string;
  timeMarker: number;
  content: string;
  createdAt: Date | null;
}

interface TimelineFeedbackProps {
  assignmentId: string;
  feedbackList: FeedbackItem[];
  isAdmin: boolean;
  /** VideoPlayer의 특정 시점 이동 콜백 */
  onSeek?: (seconds: number) => void;
  onRefresh?: () => void;
}

// ─── 관리자 피드백 작성 폼 ────────────────────────

function FeedbackForm({
  assignmentId,
  onSuccess,
}: {
  assignmentId: string;
  onSuccess?: () => void;
}) {
  const boundAction = createFeedback.bind(null, assignmentId);
  const [state, action, isPending] = useActionState<
    CreateFeedbackState,
    FormData
  >(boundAction, {});

  useEffect(() => {
    if (state.success && onSuccess) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form
      action={action}
      className="space-y-2 p-4 rounded-xl border border-dashed border-border bg-muted/20"
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        새 피드백 추가
      </p>
      <div className="flex gap-2">
        <Input
          name="timeMarker"
          type="text"
          placeholder="MM:SS"
          className="w-24 font-mono"
          pattern="[0-9]{1,2}:[0-9]{2}"
          title="예: 01:30 (분:초)"
          required
          disabled={isPending}
        />
        <Input
          name="content"
          type="text"
          placeholder="피드백 내용 입력"
          className="flex-1"
          required
          disabled={isPending}
        />
        <Button type="submit" size="sm" disabled={isPending} className="gap-1">
          <MessageSquare className="w-4 h-4" />
          추가
        </Button>
      </div>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────

export function TimelineFeedback({
  assignmentId,
  feedbackList,
  isAdmin,
  onSeek,
  onRefresh,
}: TimelineFeedbackProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (feedbackId: string) => {
    if (!confirm("이 피드백을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteFeedback(feedbackId, assignmentId);
      onRefresh?.();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          피드백
          <span className="text-sm font-normal text-muted-foreground">
            ({feedbackList.length})
          </span>
        </h3>
      </div>

      {/* 피드백 목록 */}
      {feedbackList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">아직 피드백이 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {feedbackList.map((fb) => (
            <li
              key={fb.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card group hover:bg-accent/5 transition-colors"
            >
              {/* 타임스탬프 버튼 */}
              <button
                onClick={() => onSeek?.(fb.timeMarker)}
                className="flex-shrink-0 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-mono text-xs font-bold transition-colors"
                title="이 시점으로 이동"
              >
                {formatTimestamp(fb.timeMarker)}
              </button>

              {/* 피드백 내용 */}
              <p className="flex-1 text-sm leading-relaxed">{fb.content}</p>

              {/* 삭제 버튼 (Admin only) */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(fb.id)}
                  disabled={isPending}
                  className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 -mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 관리자 피드백 작성 폼 */}
      {isAdmin && (
        <FeedbackForm assignmentId={assignmentId} onSuccess={onRefresh} />
      )}
    </div>
  );
}
