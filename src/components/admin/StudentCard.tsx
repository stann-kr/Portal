/**
 * @file src/components/admin/StudentCard.tsx
 * @description 학생 카드 컴포넌트.
 * Admin Dashboard Student Roster에서 각 학생을 표시.
 */
"use client";

import { useTransition } from "react";
import { Trash2, User, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteStudent } from "@/lib/actions/students";
import Link from "next/link";

export interface StudentCardProps {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date | null;
}

export function StudentCard({
  id,
  email,
  displayName,
  createdAt,
}: StudentCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`'${displayName ?? email}' 계정을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      await deleteStudent(id);
    });
  };

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email[0].toUpperCase();

  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <li className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors group">
      {/* 아바타 */}
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-primary">{initials}</span>
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {displayName ?? "—"}
        </p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Mail className="w-3 h-3" />
          <span className="truncate">{email}</span>
        </div>
      </div>

      {/* 가입일 */}
      <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
        <User className="w-3 h-3" />
        <span>{joinedDate}</span>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href={`/dashboard/admin/students/${id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            상세 보기
            <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </li>
  );
}
