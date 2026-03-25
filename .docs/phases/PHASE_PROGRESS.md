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

## Phase 4 — 개인 캘린더 게시판 ✅ 완료

**시작일**: 2026-03-25
**완료일**: 2026-03-25

### 완료 항목
- [x] `@fullcalendar/react`, `@fullcalendar/core` 외 플러그인 패키지 설치
- [x] `@radix-ui/react-dialog` 패키지 설치
- [x] `src/db/schema.ts` — `calendarEvents` 테이블 추가 (LESSON/PRACTICE/GIG/NOTE)
- [x] `drizzle/0004_personal_calendar_events.sql` — 마이그레이션 파일 생성 및 로컬 적용
- [x] `src/lib/actions/calendarEvents.ts` — CRUD 서버 액션 (getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent)
- [x] `src/components/ui/dialog.tsx` — Radix UI Dialog 래퍼
- [x] `src/components/calendar/EventFormDialog.tsx` — 이벤트 생성 다이얼로그 (유형/제목/시작/종료/메모)
- [x] `src/components/calendar/PersonalCalendar.tsx` — FullCalendar 컴포넌트 (월/주/일/목록 뷰, 드래그&드롭, 이벤트 상세 팝오버)
- [x] `src/app/dashboard/calendar/page.tsx` — 기존 커스텀 캘린더 → FullCalendar 기반으로 교체
- [x] `src/app/globals.css` — FullCalendar 테마 오버라이드 CSS 추가

### 색상 코딩
- LESSON: `#3B82F6` (파란색)
- PRACTICE: `#10B981` (초록색)
- GIG: `#EF4444` (빨간색)
- NOTE: `#F59E0B` (주황색)

### 참고 파일
- `CHANGE_LOG.md` → v1.1.0 항목

---

## Phase 5 — 디깅(Digging) 게시판 ✅ 완료

**시작일**: 2026-03-25
**완료일**: 2026-03-25

### 확정 설계 (원안에서 변경)
- 오디오 파일 업로드 ❌ → 링크 첨부 방식으로 변경
- Wavesurfer.js ❌ → 불필요 (링크 기반)
- 고정 컬럼 ❌ → 동적 컬럼 (digging_columns + JSON values)
- 학생 개인 전용 게시판 (isDefault 컬럼 삭제 불가)

### 완료 항목
- [x] `@tanstack/react-table` 패키지 설치
- [x] `src/db/schema.ts` — `diggingColumns`, `diggingTracks` 테이블 추가
- [x] `drizzle/0005_digging_board.sql` — 마이그레이션 생성 및 로컬 적용
- [x] `src/lib/actions/digging.ts` — CRUD + `fetchLinkMeta` (YouTube/SoundCloud oEmbed, OG 파싱)
- [x] `src/components/digging/StarRating.tsx` — 호버/선택 별점 컴포넌트
- [x] `src/components/digging/CamelotPicker.tsx` — 카멜롯 휠 키 선택기 (1A~12B)
- [x] `src/components/digging/AddTrackDialog.tsx` — 트랙 추가 + 링크 자동 추출
- [x] `src/components/digging/ColumnManager.tsx` — 컬럼 추가/삭제 관리
- [x] `src/components/digging/DiggingBoard.tsx` — TanStack Table + 날짜 범위 필터 + 날짜별 그룹핑 + 인라인 셀 편집
- [x] `src/app/dashboard/student/digging/page.tsx` — 학생 개인 디깅 보드
- [x] `src/app/dashboard/admin/students/[id]/digging/page.tsx` — 어드민 읽기 전용 뷰
- [x] 사이드바에 Digging 메뉴 추가
- [x] 어드민 학생 상세 페이지에 "Digging 보드" 링크 추가

### 기본 컬럼 (첫 방문 시 자동 시드)
- 트랙명(text), 아티스트(text), 감상평(textarea), 선호도(select), 별점(rating), 링크(link)

### 참고 파일
- `CHANGE_LOG.md` → v1.2.0 항목

---

## Phase 6 — 1:1 Q&A 게시판 ✅ 완료

**시작일**: 2026-03-25
**완료일**: 2026-03-25

### 완료 항목
- [x] `src/db/schema.ts` — `qnaThreads`, `qnaReplies` 테이블 추가 (QnaStatus: OPEN/ANSWERED/CLOSED)
- [x] `drizzle/0006_qna_board.sql` — 마이그레이션 생성 및 로컬 적용
- [x] `src/lib/actions/qna.ts` — CRUD 서버 액션 (getQnaThreads, getQnaThread, createQnaThread, createQnaReply, updateThreadStatus, getOpenThreadCount)
- [x] `src/components/qna/ThreadList.tsx` — 스레드 목록 (상태 뱃지, 어드민 학생명 표시)
- [x] `src/components/qna/ReplyCard.tsx` — 답변 카드 (어드민/학생 역할별 스타일 구분)
- [x] `src/components/qna/ThreadDetailClient.tsx` — 답변 작성 폼 + 어드민 상태 변경 버튼
- [x] `src/app/dashboard/qna/page.tsx` — Q&A 목록 페이지 (미답변 카운트 뱃지)
- [x] `src/app/dashboard/qna/new/page.tsx` — 새 질문 작성 (TiptapEditor)
- [x] `src/app/dashboard/qna/[threadId]/page.tsx` — 스레드 상세 페이지
- [x] 대시보드 사이드바 Q&A 메뉴 추가 (admin/student, 미답변 뱃지)
- [x] 커뮤니티 사이드바 '대시보드로' 뒤로가기 링크 추가 (홈 이동 불가 버그 수정)

### 자동화 로직
- 어드민 답변 작성 → 스레드 상태 자동 ANSWERED 전환
- 학생 추가 질문 작성 → 스레드 상태 자동 OPEN 재오픈

### 참고 파일
- `CHANGE_LOG.md` → v1.3.0 항목

---

## 전체 진행 요약

| Phase | 상태 | 완료일 |
|-------|------|--------|
| Phase 1 — R2 인프라 | ✅ 완료 | 2026-03-25 |
| Phase 2 — 대시보드 고도화 | ✅ 완료 | 2026-03-25 |
| Phase 3 — 커뮤니티 고도화 | ✅ 완료 | 2026-03-25 |
| Phase 4 — 개인 캘린더 | ✅ 완료 | 2026-03-25 |
| Phase 5 — 디깅 게시판 | ✅ 완료 | 2026-03-25 |
| Phase 6 — Q&A 게시판 | ✅ 완료 | 2026-03-25 |
