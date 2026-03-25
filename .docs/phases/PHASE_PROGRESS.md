# 고도화 단계별 진행 현황

LMS 고도화 각 Phase의 구현 상태, 완료 항목, 잔여 작업을 추적하는 문서.

---

## Phase 1 — R2 인프라 + 기반 구조 ✅ 완료

**완료일**: 2026-03-25

### 완료 항목
- [x] `src/lib/r2.ts` — R2 S3 클라이언트, `generatePresignedUploadUrl()`, `deleteR2Object()`
- [x] `src/lib/actions/upload.ts` — Presigned URL 발급 서버 액션 (인증 검증)
- [x] `src/components/upload/FileUploader.tsx` — 범용 파일 업로드 컴포넌트 (진행률 표시, R2 직접 PUT)
- [x] `src/modules/` — Feature-Sliced 디렉토리 구조 초기 생성 (auth/, digging/, calendar/, qna/)
- [x] `.env.example` — R2 환경 변수 5종 추가
- [x] Pages Router 공존 파일 (`_document`, `_app`, `_error`) 추가
- [x] 빌드 오류 해결: RSC 페이로드 `undefined.env` TypeError

### 버그 수정 이력
- `next.config.ts`: `@cloudflare/next-on-pages/next-dev` 제거
- `community/page.tsx`: `"use client"` 페이지가 `"use server"` 액션 직접 임포트 → RSC 래퍼 패턴 전환
- `app/layout.tsx`: `force-dynamic` 설정으로 정적 생성 오류 전면 해결
- `VideoPlayer.tsx`: `react-player` SSR 충돌 → `dynamic()` ssr:false 전환

### 참고 파일
- `TROUBLESHOOTING.md` → v0.8.0 항목
- `CHANGE_LOG.md` → v0.8.0 항목

---

## Phase 2 — 학생 대시보드 고도화 ✅ 완료

**시작일**: 2026-03-25
**완료일**: 2026-03-25

### 완료 항목
- [x] `recharts` 패키지 설치
- [x] `src/components/dashboard/ProfileCourseWidget.tsx` — 프로필 + 티어 뱃지 + 진도 바
- [x] `src/components/dashboard/UpcomingLessonsWidget.tsx` — D-day 뱃지 + .ics 다운로드
- [x] `src/components/dashboard/DiggingAnalyticsWidget.tsx` — Recharts BarChart (목데이터, Phase 5 preview)
- [x] `src/components/dashboard/PendingQnaWidget.tsx` — Q&A 스레드 목록 (목데이터, Phase 6 preview)
- [x] `src/components/dashboard/ProgressCharts.tsx` — Recharts AreaChart 스파크라인 추가, 레이아웃 리팩터
- [x] `src/app/dashboard/student/page.tsx` — 3컬럼 위젯 그리드, 독립 Suspense 병렬 스트리밍
- [x] `src/app/dashboard/admin/page.tsx` — 헤더 개선
- [x] `src/components/admin/StatsCards.tsx` — 이번 주 레슨 수 + 미답변 피드백 수 실데이터 연동, 아이콘 추가

### 데이터 연결 상태
- **실데이터**: 프로필, 진행률, 임박 레슨, 수강생 통계 카드
- **목데이터** (Phase 완료 후 교체 예정):
  - DiggingAnalyticsWidget → Phase 5 완료 후 실 DB 연동
  - PendingQnaWidget → Phase 6 완료 후 실 DB 연동

### 참고 파일
- `CHANGE_LOG.md` → v0.9.0 항목

---

## Phase 3 — 커뮤니티 게시판 고도화 ✅ 완료

**시작일**: 2026-03-25
**완료일**: 2026-03-25

### 완료 항목
- [x] `src/db/schema.ts` — `posts` 테이블에 `boardType`, `isPinned`, `mediaUrl` 컬럼 추가
- [x] `drizzle/0003_community_board_type.sql` — Drizzle 마이그레이션 파일 생성
- [x] 로컬 D1 마이그레이션 적용 (`wrangler d1 migrations apply portal-db --local`)
- [x] `src/lib/actions/posts.ts` — `getPostsByBoardType()`, `togglePinPost()` 추가, `deletePost()` 시그니처 정리
- [x] `src/components/ui/accordion.tsx` — Radix UI Accordion 래퍼 (신규)
- [x] `src/components/ui/tabs.tsx` — Radix UI Tabs 래퍼 (신규)
- [x] `src/components/community/AnnouncementList.tsx` — Accordion 기반 공지 UI, 어드민 핀 토글
- [x] `src/components/community/MixsetFeedbackCard.tsx` — 인라인 HTML5 오디오 플레이어
- [x] `src/app/community/page.tsx` — RSC 래퍼 유지 (force-dynamic)
- [x] `src/app/community/CommunityClient.tsx` — 3탭(ANNOUNCEMENT/GENERAL/FEEDBACK) 클라이언트 UI
- [x] `src/app/community/new/page.tsx` — boardType 선택 + FEEDBACK 오디오 R2 업로드
- [x] `src/app/community/[postId]/PostDetailClient.tsx` — `deletePost` 호출 시그니처 수정
- [x] `src/app/globals.css` — accordion 애니메이션 keyframe 추가

### 참고 파일
- `CHANGE_LOG.md` → v1.0.0 항목

---

## Phase 4 — 개인 캘린더 게시판 ⏳ 예정

**목표**: FullCalendar 기반 개인 일정 관리 (LESSON/PRACTICE/GIG/NOTE)

**주요 변경**:
- `calendarEvents` 테이블 신규 추가 (Drizzle Migration)
- FullCalendar 컴포넌트 + 드래그&드롭
- 이벤트 타입별 색상 코딩

---

## Phase 5 — 디깅(Digging) 게시판 ⏳ 예정

**목표**: TanStack Table + Wavesurfer.js + 카멜롯 키 믹싱 로직

**선행 조건**: Phase 1 R2 인프라 완료 ✅

**주요 변경**:
- `diggingTracks` 테이블 신규 추가 (Drizzle Migration)
- Fuzzy Key Mixing 카멜롯 휠 유틸
- Persistent Bottom Player (AudioPlayerContext)

---

## Phase 6 — 1:1 Q&A 게시판 ⏳ 예정

**목표**: 스레드 기반 Q&A (TiptapEditor + R2 첨부)

**주요 변경**:
- `qnaThreads`, `qnaReplies` 테이블 신규 추가 (Drizzle Migration)
- 상태 관리: OPEN / ANSWERED / CLOSED
- Admin: 전체 학생 Q&A 목록 + OPEN 필터링

---

## 전체 진행 요약

| Phase | 상태 | 완료일 |
|-------|------|--------|
| Phase 1 — R2 인프라 | ✅ 완료 | 2026-03-25 |
| Phase 2 — 대시보드 고도화 | ✅ 완료 | 2026-03-25 |
| Phase 3 — 커뮤니티 고도화 | ✅ 완료 | 2026-03-25 |
| Phase 4 — 개인 캘린더 | ⏳ 예정 | — |
| Phase 5 — 디깅 게시판 | ⏳ 예정 | — |
| Phase 6 — Q&A 게시판 | ⏳ 예정 | — |
