/**
 * @file src/app/dashboard/student/assignments/[id]/page.tsx
 * @description 과제 상세 페이지 — VideoPlayer + 타임라인 피드백.
 * Student: 영상 재생, 피드백 조회.
 * Admin: 피드백 작성 가능 (role 체크).
 * 핵심 기능: 타임스탬프 클릭 → VideoPlayer seekTo 연동.
 */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import {
  TimelineFeedback,
  type FeedbackItem,
} from "@/components/feedback/TimelineFeedback";
import { getAssignmentById } from "@/lib/actions/assignments";
import { getFeedbacksByAssignment } from "@/lib/actions/feedbacks";
import { auth } from "@/auth";

type Assignment = Awaited<ReturnType<typeof getAssignmentById>>;

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const assignmentId = params.id;

  const [assignment, setAssignment] = useState<Assignment>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // VideoPlayer에 seekTo 요청을 전달하기 위한 state
  const [seekToSeconds, setSeekToSeconds] = useState<number | undefined>(
    undefined,
  );

  const refresh = async () => {
    const [a, fb, session] = await Promise.all([
      getAssignmentById(assignmentId),
      getFeedbacksByAssignment(assignmentId),
      auth(),
    ]);
    setAssignment(a);
    setFeedbackList(
      fb.map((f) => ({
        id: f.id,
        timeMarker: f.timeMarker,
        content: f.content,
        createdAt: f.createdAt,
      })),
    );
    setIsAdmin(session?.user?.role === "admin");
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 타임스탬프 클릭 → VideoPlayer seekTo
  const handleSeek = (seconds: number) => {
    setSeekToSeconds(seconds);
    // 같은 값 재클릭 시 재트리거를 위해 살짝 delay 후 reset
    setTimeout(() => setSeekToSeconds(undefined), 100);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-4 animate-pulse">
        <div className="h-6 w-24 bg-muted rounded" />
        <div className="aspect-video rounded-xl bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto py-6 text-center text-muted-foreground">
        <p>과제를 찾을 수 없습니다.</p>
        <Link
          href="/dashboard/student/assignments"
          className="text-sm underline mt-2 block"
        >
          목록으로
        </Link>
      </div>
    );
  }

  const submittedDate = assignment.submittedAt
    ? new Date(assignment.submittedAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* 헤더 */}
      <div className="space-y-1">
        <Link
          href="/dashboard/student/assignments"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          My Assignments
        </Link>
        <h1 className="text-xl font-semibold mt-2 break-all">
          {assignment.mediaUrl}
        </h1>
        <p className="text-sm text-muted-foreground">제출일: {submittedDate}</p>
      </div>

      {/* 2열 레이아웃 (lg 이상) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* 비디오 플레이어 */}
        <div className="lg:sticky lg:top-6">
          <VideoPlayer
            url={assignment.mediaUrl}
            seekToSeconds={seekToSeconds}
          />
        </div>

        {/* 타임라인 피드백 */}
        <TimelineFeedback
          assignmentId={assignmentId}
          feedbackList={feedbackList}
          isAdmin={isAdmin}
          onSeek={handleSeek}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
}
