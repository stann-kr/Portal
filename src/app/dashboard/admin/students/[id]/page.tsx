/**
 * @file src/app/dashboard/admin/students/[id]/page.tsx
 * @description 학생 상세 페이지 (Admin 전용).
 * - 학생 기본 정보
 * - 커리큘럼 모듈 목록 + 추가
 * - 레슨 일정 목록 + 추가
 * - .ics 구독 URL 안내
 */
"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  BookOpen,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getStudentById,
  type CreateStudentState,
} from "@/lib/actions/students";
import {
  getCurriculumByStudent,
  createModule,
  deleteModule,
  type CreateModuleState,
} from "@/lib/actions/curriculum";
import {
  getLessonsByStudent,
  createLesson,
  deleteLesson,
  type CreateLessonState,
} from "@/lib/actions/lessons";

// ─── 타입 ───────────────────────────────────────
type Profile = Awaited<ReturnType<typeof getStudentById>>;
type Module = Awaited<ReturnType<typeof getCurriculumByStudent>>[number];
type Lesson = Awaited<ReturnType<typeof getLessonsByStudent>>[number];

// ─── 커리큘럼 추가 폼 ────────────────────────────

function AddModuleForm({
  studentId,
  onSuccess,
}: {
  studentId: string;
  onSuccess: () => void;
}) {
  const boundAction = createModule.bind(null, studentId);
  const [state, action, isPending] = useActionState<
    CreateModuleState,
    FormData
  >(boundAction, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={action} className="flex gap-2 mt-3">
      <Input
        name="weekNum"
        type="number"
        min={1}
        placeholder="주차"
        className="w-20"
        required
        disabled={isPending}
      />
      <Input
        name="title"
        type="text"
        placeholder="모듈 제목 (예: BPM 매칭 연습)"
        className="flex-1"
        required
        disabled={isPending}
      />
      <Button type="submit" size="sm" disabled={isPending} className="gap-1">
        <Plus className="w-4 h-4" />
        추가
      </Button>
      {state.error && (
        <p className="text-xs text-destructive self-center">{state.error}</p>
      )}
    </form>
  );
}

// ─── 레슨 추가 폼 ────────────────────────────────

function AddLessonForm({
  studentId,
  onSuccess,
}: {
  studentId: string;
  onSuccess: () => void;
}) {
  const boundAction = createLesson.bind(null, studentId);
  const [state, action, isPending] = useActionState<
    CreateLessonState,
    FormData
  >(boundAction, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={action} className="flex gap-2 mt-3">
      <Input
        name="scheduledAt"
        type="datetime-local"
        required
        disabled={isPending}
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={isPending} className="gap-1">
        <Plus className="w-4 h-4" />
        추가
      </Button>
      {state.error && (
        <p className="text-xs text-destructive self-center">{state.error}</p>
      )}
    </form>
  );
}

// ─── 메인 페이지 ────────────────────────────────

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const studentId = params?.id ?? "";

  const [student, setStudent] = useState<Profile>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonList, setLessonList] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = async () => {
    const [s, m, l] = await Promise.all([
      getStudentById(studentId),
      getCurriculumByStudent(studentId),
      getLessonsByStudent(studentId),
    ]);
    setStudent(s);
    setModules(m);
    setLessonList(l);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteModule = (moduleId: string) => {
    if (!confirm("이 모듈을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteModule(moduleId, studentId);
      await refresh();
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!confirm("이 레슨을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteLesson(lessonId, studentId);
      await refresh();
    });
  };

  const icsUrl = `/api/calendar/${studentId}`;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-10 w-64 bg-muted rounded" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-3xl mx-auto py-6 text-center text-muted-foreground">
        <p>학생을 찾을 수 없습니다.</p>
        <Link href="/dashboard/admin" className="text-sm underline mt-2 block">
          돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-10">
      {/* 헤더 */}
      <div className="space-y-1">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mt-2">
              {student.displayName ?? student.email}
            </h1>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/dashboard/admin/students/${studentId}/notes`}>
              <BookOpen className="w-4 h-4" />
              1:1 Notes 보드
            </Link>
          </Button>
        </div>
      </div>

      {/* 커리큘럼 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">커리큘럼</h2>
          <span className="ml-auto text-sm text-muted-foreground">
            {modules.length}개
          </span>
        </div>

        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            등록된 모듈이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {modules.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card group"
              >
                {m.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="text-xs font-bold text-muted-foreground w-12">
                  WEEK {String(m.weekNum).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm font-medium">{m.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteModule(m.id)}
                  disabled={isPending}
                  className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <AddModuleForm studentId={studentId} onSuccess={refresh} />
      </section>

      {/* 레슨 일정 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <CalendarDays className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">레슨 일정</h2>
          <span className="ml-auto text-sm text-muted-foreground">
            {lessonList.length}개
          </span>
        </div>

        {/* .ics 구독 URL */}
        <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border bg-muted/20">
          <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">
            캘린더 구독 URL (학생에게 공유)
          </p>
          <a
            href={icsUrl}
            download
            className="text-xs font-mono text-primary hover:underline"
          >
            {typeof window !== "undefined"
              ? `${window.location.origin}${icsUrl}`
              : icsUrl}
          </a>
        </div>

        {lessonList.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            등록된 레슨이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {lessonList.map((l) => {
              const date = new Date(l.scheduledAt!);
              const isPast = date < new Date();
              return (
                <li
                  key={l.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-border bg-card group ${isPast ? "opacity-50" : ""}`}
                >
                  <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {date.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {isPast && " · 완료"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLesson(l.id)}
                    disabled={isPending}
                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        <AddLessonForm studentId={studentId} onSuccess={refresh} />
      </section>
    </div>
  );
}
