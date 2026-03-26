/**
 * @file src/components/student-portal/AssignmentView.tsx
 * @description 과제 뷰 — 믹스셋 제출 폼 + 제출 리스트 + SlidePanel 상세.
 * RSC에서 프리패치한 initialAssignments를 props로 받아 클라이언트 상태 관리.
 */
"use client";

import { useState, useActionState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Youtube, Music, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InferSelectModel } from "drizzle-orm";
import { assignments } from "@/db/schema";
import {
  submitAssignment,
  getMyAssignments,
  type SubmitAssignmentState,
} from "@/lib/actions/assignments";
import { getMyFeedbacksMap } from "@/lib/actions/feedbacks";

type RawAssignment = InferSelectModel<typeof assignments>;
import { SlidePanel } from "./SlidePanel";
import { AssignmentDetailPanel } from "./AssignmentDetailPanel";

// ── 타입 ──────────────────────────────────────────

type Assignment = {
  id: string;
  mediaUrl: string;
  submittedAt: Date | null;
  feedbackCount: number;
};

interface AssignmentViewProps {
  initialAssignments: Assignment[];
}

// ── 헬퍼 ─────────────────────────────────────────

function mediaIcon(url: string) {
  if (url.includes("youtube") || url.includes("youtu.be"))
    return <Youtube className="w-4 h-4 text-red-500" />;
  return <Music className="w-4 h-4 text-orange-500" />;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── 제출 폼 ──────────────────────────────────────

function SubmitForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, isPending] = useActionState<SubmitAssignmentState, FormData>(
    submitAssignment,
    {},
  );

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form
      action={action}
      className="space-y-3 p-4 rounded-xl border border-dashed border-border bg-muted/20"
    >
      <p className="text-sm font-semibold">새 믹스셋 제출</p>
      <div className="flex gap-2">
        <Input
          name="mediaUrl"
          type="url"
          placeholder="YouTube 또는 SoundCloud URL"
          required
          disabled={isPending}
          className="flex-1"
        />
        <Button type="submit" disabled={isPending} className="gap-1.5">
          <Upload className="w-4 h-4" />
          {isPending ? "제출 중..." : "제출"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────

export function AssignmentView({ initialAssignments }: AssignmentViewProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  // 상세 패널 상태
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [panelOpen, setPanelOpen] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getMyAssignments();
    const fbMap = await getMyFeedbacksMap();
    setAssignments(
      (data as RawAssignment[]).map((a) => ({
        id: a.id,
        mediaUrl: a.mediaUrl,
        submittedAt: a.submittedAt,
        feedbackCount: fbMap[a.id] ?? 0,
      })),
    );
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      {/* 제출 폼 */}
      <SubmitForm onSuccess={refresh} />

      {/* 제출 목록 */}
      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-xl bg-muted/10 text-muted-foreground gap-2">
          <p className="text-sm">제출된 과제가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {assignments.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => {
                  setSelectedId(a.id);
                  setSelectedUrl(a.mediaUrl);
                  setPanelOpen(true);
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
              >
                {mediaIcon(a.mediaUrl)}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {a.mediaUrl}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(a.submittedAt)}
                  </p>
                </div>

                {a.feedbackCount > 0 && (
                  <span className="flex-shrink-0 min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                    {a.feedbackCount}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 상세 SlidePanel */}
      <SlidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title="과제 상세"
        size="lg"
      >
        {selectedId && (
          <AssignmentDetailPanel
            assignmentId={selectedId}
            mediaUrl={selectedUrl}
          />
        )}
      </SlidePanel>
    </div>
  );
}
