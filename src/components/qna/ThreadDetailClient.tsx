/**
 * @file src/components/qna/ThreadDetailClient.tsx
 * @description Q&A 스레드 상세 클라이언트 컴포넌트.
 * 답변 작성 폼(TiptapEditor) + 어드민 상태 변경 버튼.
 */
"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import TiptapEditor from "@/components/community/TiptapEditor";
import { ReplyCard } from "./ReplyCard";
import { createQnaReply, updateThreadStatus, type CreateReplyState } from "@/lib/actions/qna";
import type { QnaStatus } from "@/db/schema";

type Reply = {
  id: string;
  contentHtml: string;
  attachmentUrl: string | null | undefined;
  createdAt: Date | null | undefined;
  authorName: string | null | undefined;
  authorEmail: string | null | undefined;
  authorRole: string | null | undefined;
};

interface ThreadDetailClientProps {
  threadId: string;
  status: QnaStatus;
  replies: Reply[];
  isAdmin: boolean;
  isClosed: boolean;
}

const STATUS_LABELS: Record<QnaStatus, string> = {
  OPEN: "미답변",
  ANSWERED: "답변완료",
  CLOSED: "종료",
};

export function ThreadDetailClient({
  threadId,
  status,
  replies: initialReplies,
  isAdmin,
  isClosed,
}: ThreadDetailClientProps) {
  const [contentHtml, setContentHtml] = useState("");
  const [isPending, startTransition] = useTransition();

  const boundAction = createQnaReply.bind(null, threadId);
  const [replyState, replyAction, isReplying] = useActionState<
    CreateReplyState,
    FormData
  >(boundAction, {});

  const handleStatusChange = (newStatus: QnaStatus) => {
    startTransition(() => updateThreadStatus(threadId, newStatus));
  };

  return (
    <div className="space-y-6">
      {/* 답변 목록 */}
      <div className="space-y-4">
        {initialReplies.map((reply) => (
          <ReplyCard key={reply.id} reply={reply} />
        ))}
      </div>

      {/* 구분선 */}
      <div className="border-t border-border" />

      {/* 어드민 상태 변경 */}
      {isAdmin && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">상태 변경:</span>
          {(["OPEN", "ANSWERED", "CLOSED"] as QnaStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={status === s || isPending}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                status === s
                  ? s === "OPEN"
                    ? "bg-red-500/20 text-red-500"
                    : s === "ANSWERED"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-muted text-muted-foreground"
                  : "border border-border text-muted-foreground hover:bg-accent"
              } disabled:cursor-default`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* 답변 작성 폼 */}
      {!isClosed && (
        <form action={replyAction} className="space-y-3">
          <input type="hidden" name="contentHtml" value={contentHtml} />
          <p className="text-sm font-medium text-foreground">
            {isAdmin ? "답변 작성" : "추가 질문"}
          </p>
          {replyState.error && (
            <p className="text-sm text-destructive">{replyState.error}</p>
          )}
          <div className="rounded-xl border border-border overflow-hidden">
            <TiptapEditor onSubmit={(html) => setContentHtml(html)} />
          </div>
          <Button type="submit" disabled={isReplying} className="gap-2">
            {isReplying ? "등록 중..." : isAdmin ? "답변 등록" : "질문 추가"}
          </Button>
        </form>
      )}

      {isClosed && (
        <p className="text-sm text-muted-foreground text-center py-4">
          종료된 스레드입니다.
        </p>
      )}
    </div>
  );
}
