"use client";

import { useActionState, useState } from "react";
import { createPrivateNote, type CreateNoteState } from "@/lib/actions/privateNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/community/TiptapEditor";

const initialState: CreateNoteState = {};

export function PrivateNoteForm({ studentId }: { studentId: string }) {
  const boundAction = createPrivateNote.bind(null, studentId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [contentHtml, setContentHtml] = useState("");

  const handleSubmit = (html: string) => {
    setContentHtml(html);
  };

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.success && <p className="text-sm text-green-500">생성되었습니다.</p>}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">제목</label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          placeholder="오늘의 수업 요약"
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">내용</label>
        <input type="hidden" name="contentHtml" value={contentHtml} />
        <div className="border border-border rounded-lg overflow-hidden">
          <TiptapEditor onSubmit={handleSubmit} />
        </div>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "작성 중..." : "노트 저장"}
      </Button>
    </form>
  );
}
