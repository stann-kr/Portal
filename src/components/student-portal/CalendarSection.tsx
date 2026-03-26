/**
 * @file src/components/student-portal/CalendarSection.tsx
 * @description 캘린더 섹션 — 5개 뷰 탭 (캘린더 / 일별 목록 / 전체 항목 / 커리큘럼 / 과제).
 * 우측 상단 "+" 버튼으로 UnifiedCreateDialog 열기.
 */
"use client";

import { useState } from "react";
import { Plus, CalendarDays, List, Grid3x3, BookOpen, FileVideo } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { UnifiedItem } from "@/lib/utils/unifiedItemUtils";
import { UnifiedCalendar } from "./UnifiedCalendar";
import { DailyListView } from "./DailyListView";
import { AllItemsView } from "./AllItemsView";
import { CurriculumView } from "./CurriculumView";
import { AssignmentView } from "./AssignmentView";
import { UnifiedCreateDialog } from "./UnifiedCreateDialog";

// ── 타입 ──────────────────────────────────────────

type CurriculumModule = {
  id: string;
  weekNum: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
};

type Assignment = {
  id: string;
  mediaUrl: string;
  submittedAt: Date | null;
  feedbackCount: number;
};

interface CalendarSectionProps {
  unifiedItems: UnifiedItem[];
  curriculumModules: CurriculumModule[];
  assignments: Assignment[];
  studentId: string;
}

// ── 컴포넌트 ─────────────────────────────────────

export function CalendarSection({
  unifiedItems,
  curriculumModules,
  assignments,
}: CalendarSectionProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<string | undefined>(undefined);

  // 날짜 클릭 시 생성 다이얼로그 오픈
  const handleCreateRequest = (date: string) => {
    setCreateDefaultDate(date);
    setCreateDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="calendar" className="flex flex-col h-full">
        {/* 탭 헤더 */}
        <div className="flex items-center justify-between px-6 pt-4 pb-0 border-b border-border flex-shrink-0">
          <TabsList className="h-9 bg-transparent p-0 gap-0 border-b-0">
            <TabsTrigger
              value="calendar"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              캘린더
            </TabsTrigger>
            <TabsTrigger
              value="daily"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <List className="w-3.5 h-3.5" />
              일별 목록
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Grid3x3 className="w-3.5 h-3.5" />
              전체 항목
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <BookOpen className="w-3.5 h-3.5" />
              커리큘럼
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <FileVideo className="w-3.5 h-3.5" />
              과제
            </TabsTrigger>
          </TabsList>

          {/* 생성 버튼 */}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-7 text-xs"
            onClick={() => {
              setCreateDefaultDate(undefined);
              setCreateDialogOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            추가
          </Button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1 overflow-auto">
          <TabsContent value="calendar" className="h-full m-0 p-4">
            <div className="h-[600px]">
              <UnifiedCalendar
                items={unifiedItems}
                onCreateRequest={handleCreateRequest}
              />
            </div>
          </TabsContent>

          <TabsContent value="daily" className="m-0 p-6">
            <DailyListView items={unifiedItems} />
          </TabsContent>

          <TabsContent value="all" className="m-0 p-6">
            <AllItemsView items={unifiedItems} />
          </TabsContent>

          <TabsContent value="curriculum" className="m-0 p-6 max-w-3xl mx-auto">
            <CurriculumView initialModules={curriculumModules} />
          </TabsContent>

          <TabsContent value="assignments" className="m-0 p-6 max-w-3xl mx-auto">
            <AssignmentView initialAssignments={assignments} />
          </TabsContent>
        </div>
      </Tabs>

      {/* 통합 생성 다이얼로그 */}
      <UnifiedCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultDate={createDefaultDate}
      />
    </div>
  );
}
