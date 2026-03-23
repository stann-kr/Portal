"use client";

import { useTransition } from "react";
import { deletePrivateNote } from "@/lib/actions/privateNotes";
import { Trash2 } from "lucide-react";

export function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("정말 이 노트를 삭제하시겠습니까?")) {
      startTransition(async () => {
        await deletePrivateNote(noteId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
      title="노트 삭제"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
