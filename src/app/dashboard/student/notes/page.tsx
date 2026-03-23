/**
 * @file src/app/dashboard/student/notes/page.tsx
 * @description 1:1 Private Notes (Student View)
 */
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, MessageSquarePlus } from "lucide-react";
import { getPrivateNotes } from "@/lib/actions/privateNotes";
import { PrivateNoteForm } from "@/components/notes/PrivateNoteForm";
import { DeleteNoteButton } from "@/components/notes/DeleteNoteButton";

export default async function StudentNotesPage() {
  const session = await auth();
  if (session?.user?.role !== "student") {
    redirect("/dashboard/admin");
  }

  const studentId = session.user.id!;
  const notes = await getPrivateNotes(studentId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* 헤더 */}
      <div className="space-y-1">
        <Link
          href="/dashboard/student"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          1:1 수업 노트
        </h1>
        <p className="text-sm text-muted-foreground">
          강사님과 프라이빗하게 피드백과 자료를 공유하는 공간입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 새 노트 작성 */}
        <div className="md:col-span-1">
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <MessageSquarePlus className="w-5 h-5 text-muted-foreground" />
              질문 또는 노트 작성
            </h2>
            <PrivateNoteForm studentId={studentId} />
          </div>
        </div>

        {/* 노트 목록 */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">노트 기록 ({notes.length})</h2>
          {notes.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/10">
              <p className="text-sm">아직 작성된 1:1 노트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note: any) => (
                <div key={note.id} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{note.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{note.authorName || "Unknown"}</span>
                        <span>·</span>
                        <span>
                          {new Date(note.createdAt!).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    {session.user.id === note.authorId && (
                      <DeleteNoteButton noteId={note.id} />
                    )}
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: note.contentHtml }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
