/**
 * @file src/components/student-portal/UnifiedCreateDialog.tsx
 * @description 통합 엔트리 생성 다이얼로그.
 * Step 1: 타입 선택 (일정 / 노트 / 디깅 / Q&A).
 * Step 2: 선택한 타입의 전용 폼 렌더링.
 */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarPlus, FileText, Music, HelpCircle } from "lucide-react";
import { EventFormDialog } from "@/components/calendar/EventFormDialog";

// ── 타입 선택 정의 ────────────────────────────────

type EntryType = "event" | "note" | "digging" | "qna";

const ENTRY_TYPES: {
  id: EntryType;
  label: string;
  description: string;
  Icon: React.ElementType;
  color: string;
}[] = [
  {
    id: "event",
    label: "일정 추가",
    description: "레슨, 연습, 공연 등",
    Icon: CalendarPlus,
    color: "text-blue-500",
  },
  {
    id: "note",
    label: "노트 작성",
    description: "1:1 개인 메모",
    Icon: FileText,
    color: "text-violet-500",
  },
  {
    id: "digging",
    label: "디깅 트랙",
    description: "참고 트랙 추가",
    Icon: Music,
    color: "text-pink-500",
  },
  {
    id: "qna",
    label: "Q&A 질문",
    description: "강사에게 질문",
    Icon: HelpCircle,
    color: "text-orange-500",
  },
];

// ── 컴포넌트 ─────────────────────────────────────

interface UnifiedCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 날짜 클릭으로 열린 경우 기본 시작일 (ISO string) */
  defaultDate?: string;
  onSuccess?: () => void;
}

export function UnifiedCreateDialog({
  open,
  onOpenChange,
  defaultDate,
  onSuccess,
}: UnifiedCreateDialogProps) {
  const [selectedType, setSelectedType] = useState<EntryType | null>(null);

  // EventFormDialog는 독립 dialog로 관리
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const handleTypeSelect = (type: EntryType) => {
    if (type === "event") {
      onOpenChange(false);
      setEventDialogOpen(true);
    } else {
      setSelectedType(type);
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    onOpenChange(false);
  };

  const handleSuccess = () => {
    handleClose();
    onSuccess?.();
  };

  return (
    <>
      {/* 타입 선택 다이얼로그 */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>무엇을 추가할까요?</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {ENTRY_TYPES.map(({ id, label, description, Icon, color }) => (
              <button
                key={id}
                onClick={() => handleTypeSelect(id)}
                className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-left"
              >
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 노트 / 디깅 / Q&A: 간이 안내 (Phase 4 이후 폼 임베드 확장 가능) */}
          {selectedType && selectedType !== "event" && (
            <div className="pt-2 text-sm text-muted-foreground text-center border-t border-border mt-2">
              {selectedType === "note" && (
                <p>노트 작성은 커뮤니티 탭에서 이용하세요.</p>
              )}
              {selectedType === "digging" && (
                <p>디깅 트랙은 캘린더 → 전체 항목 탭에서 추가하세요.</p>
              )}
              {selectedType === "qna" && (
                <p>Q&A 질문은 상단 Q&A 링크를 이용하세요.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 일정 생성 다이얼로그 (별도 관리) */}
      <EventFormDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        defaultStart={defaultDate}
        onSuccess={handleSuccess}
      />
    </>
  );
}
