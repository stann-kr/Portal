/**
 * @file src/components/student-portal/StudentPortalClient.tsx
 * @description 학생 원페이지 포털 메인 오케스트레이터.
 * 3개 섹션(공지사항 / 캘린더 / 커뮤니티)을 상단 탭으로 전환.
 * CSS opacity 전환으로 페이드 애니메이션 구현 (framer-motion 미사용).
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { Megaphone, CalendarDays, Users } from "lucide-react";
import type { UnifiedItem } from "@/lib/utils/unifiedItemUtils";

// ── 섹션 컴포넌트
import { AnnouncementSection } from "./AnnouncementSection";
import { CalendarSection } from "./CalendarSection";
import { CommunitySection } from "./CommunitySection";

// ── 타입 ──────────────────────────────────────────────

type Section = "announcements" | "calendar" | "community";

type Post = {
  id: string;
  title: string;
  contentHtml: string;
  isPinned: boolean;
  authorName: string | null;
  authorEmail: string | null;
  createdAt: Date | null;
};

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

type CommunityPost = {
  id: string;
  title: string;
  contentHtml: string;
  boardType: string;
  isPinned: boolean;
  authorName: string | null;
  authorEmail: string | null;
  createdAt: Date | null;
};

export interface StudentPortalClientProps {
  announcements: Post[];
  unifiedItems: UnifiedItem[];
  curriculumModules: CurriculumModule[];
  assignments: Assignment[];
  communityPosts: CommunityPost[];
  studentId: string;
  displayName: string;
}

// ── 탭 정의 ──────────────────────────────────────────

const TABS: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: "announcements", label: "공지사항", Icon: Megaphone },
  { id: "calendar",      label: "캘린더",   Icon: CalendarDays },
  { id: "community",     label: "커뮤니티", Icon: Users },
];

// ── 컴포넌트 ─────────────────────────────────────────

export function StudentPortalClient({
  announcements,
  unifiedItems,
  curriculumModules,
  assignments,
  communityPosts,
  studentId,
  displayName,
}: StudentPortalClientProps) {
  const [activeSection, setActiveSection] = useState<Section>("announcements");
  const [visible, setVisible] = useState(true);
  const nextSection = useRef<Section | null>(null);

  // 페이드 아웃 → 섹션 교체 → 페이드 인
  const changeSection = (next: Section) => {
    if (next === activeSection) return;
    nextSection.current = next;
    setVisible(false);
  };

  useEffect(() => {
    if (!visible && nextSection.current) {
      const timer = setTimeout(() => {
        setActiveSection(nextSection.current!);
        nextSection.current = null;
        setVisible(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* 상단 탭 바 */}
      <header className="flex items-center gap-1 px-6 pt-5 pb-0 border-b border-border bg-background sticky top-0 z-10">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => changeSection(id)}
              className={`
                inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-md border-b-2 transition-colors
                ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}

        {/* 우측 — 인사 텍스트 */}
        <div className="ml-auto pr-1 hidden sm:block">
          <p className="text-xs text-muted-foreground">
            안녕하세요,{" "}
            <span className="font-medium text-foreground">{displayName}</span>
          </p>
        </div>
      </header>

      {/* 섹션 콘텐츠 — CSS opacity 전환 */}
      <div
        className={`flex-1 overflow-hidden transition-opacity duration-150 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {activeSection === "announcements" && (
          <div className="p-6 max-w-3xl mx-auto">
            <AnnouncementSection posts={announcements} />
          </div>
        )}

        {activeSection === "calendar" && (
          <CalendarSection
            unifiedItems={unifiedItems}
            curriculumModules={curriculumModules}
            assignments={assignments}
            studentId={studentId}
          />
        )}

        {activeSection === "community" && (
          <div className="p-6 max-w-4xl mx-auto">
            <CommunitySection
              initialPosts={communityPosts}
              studentId={studentId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
