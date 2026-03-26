/**
 * @file src/components/student-portal/AssignmentDetailPanel.tsx
 * @description SlidePanel 내 과제 상세 뷰.
 * VideoPlayer + 타임라인 피드백 리스트 (읽기 전용).
 */
"use client";

import { useState, useEffect } from "react";
import type { InferSelectModel } from "drizzle-orm";
import { feedbacks } from "@/db/schema";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { getFeedbacksByAssignment } from "@/lib/actions/feedbacks";

type RawFeedback = InferSelectModel<typeof feedbacks>;

type Feedback = {
  id: string;
  timeMarker: number;
  content: string;
};

interface AssignmentDetailPanelProps {
  assignmentId: string;
  mediaUrl: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AssignmentDetailPanel({
  assignmentId,
  mediaUrl,
}: AssignmentDetailPanelProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedbacksByAssignment(assignmentId).then((data) => {
      setFeedbacks(
        (data as RawFeedback[]).map((f) => ({
          id: f.id,
          timeMarker: f.timeMarker ?? 0,
          content: f.content,
        })),
      );
      setLoading(false);
    });
  }, [assignmentId]);

  return (
    <div className="space-y-6">
      {/* 비디오 플레이어 */}
      <div className="rounded-lg overflow-hidden bg-black aspect-video">
        <VideoPlayer url={mediaUrl} seekToSeconds={seekTo} />
      </div>

      {/* 피드백 리스트 */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          강사 피드백
        </h4>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            아직 피드백이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {feedbacks.map((fb) => (
              <li
                key={fb.id}
                className="flex gap-3 p-3 rounded-lg border border-border bg-card"
              >
                <button
                  onClick={() => setSeekTo(fb.timeMarker)}
                  className="flex-shrink-0 font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded hover:bg-primary/20 transition-colors"
                  title={`${formatTime(fb.timeMarker)}으로 이동`}
                >
                  {formatTime(fb.timeMarker)}
                </button>
                <p className="text-sm text-foreground leading-relaxed">{fb.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
