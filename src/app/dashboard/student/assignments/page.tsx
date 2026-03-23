/**
 * @file src/app/dashboard/student/assignments/page.tsx
 * @description 과제 목록 페이지 (Student 전용).
 * 제출된 과제 목록과 피드백 여부를 표시. 새 과제 제출 폼 포함.
 */
"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Youtube, Music, ChevronRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  submitAssignment,
  getMyAssignments,
  type SubmitAssignmentState,
} from "@/lib/actions/assignments";
import { getFeedbacksByAssignment } from "@/lib/actions/feedbacks";

type Assignment = Awaited<ReturnType<typeof getMyAssignments>>[number];

function mediaIcon(url: string) {
  if (url.includes("youtube") || url.includes("youtu.be"))
    return <Youtube className="w-4 h-4 text-red-500" />;
  return <Music className="w-4 h-4 text-orange-500" />;
}

// ─── 제출 폼 ─────────────────────────────────────

function SubmitForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, isPending] = useActionState<
    SubmitAssignmentState,
    FormData
  >(submitAssignment, {});

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

// ─── 메인 ────────────────────────────────────────

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [feedbackCounts, setFeedbackCounts] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const data = await getMyAssignments();
    setAssignments(data);

    const counts: Record<string, number> = {};
    await Promise.all(
      data.map(async (a: any) => {
        const fb = await getFeedbacksByAssignment(a.id);
        counts[a.id] = fb.length;
      }),
    );
    setFeedbackCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          My Assignments
        </h1>
        <p className="text-sm text-muted-foreground">
          제출한 믹스셋과 강사 피드백을 확인합니다.
        </p>
      </header>

      <SubmitForm onSuccess={refresh} />

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center py-12 border border-dashed rounded-xl text-muted-foreground space-y-2">
          <p className="text-sm">제출된 과제가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {assignments.map((a) => {
            const count = feedbackCounts[a.id] ?? 0;
            const date = a.submittedAt
              ? new Date(a.submittedAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—";

            return (
              <li key={a.id}>
                <Link
                  href={`/dashboard/student/assignments/${a.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors group"
                >
                  {mediaIcon(a.mediaUrl)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.mediaUrl}</p>
                    <p className="text-xs text-muted-foreground">{date}</p>
                  </div>
                  {count > 0 ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0">
                      피드백 {count}개
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      피드백 없음
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
