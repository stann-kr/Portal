"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { TimelineFeedback, type FeedbackItem } from "@/components/feedback/TimelineFeedback";

interface AssignmentDetailClientProps {
  assignmentId: string;
  mediaUrl: string;
  feedbackList: FeedbackItem[];
  isAdmin: boolean;
}

export function AssignmentDetailClient({
  assignmentId,
  mediaUrl,
  feedbackList,
  isAdmin,
}: AssignmentDetailClientProps) {
  const [seekToSeconds, setSeekToSeconds] = useState<number | undefined>(undefined);

  const handleSeek = (seconds: number) => {
    setSeekToSeconds(seconds);
    setTimeout(() => setSeekToSeconds(undefined), 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="lg:sticky lg:top-6">
        <VideoPlayer url={mediaUrl} seekToSeconds={seekToSeconds} />
      </div>
      <TimelineFeedback
        assignmentId={assignmentId}
        feedbackList={feedbackList}
        isAdmin={isAdmin}
        onSeek={handleSeek}
      />
    </div>
  );
}
