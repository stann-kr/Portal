# 변경 이력 (Change Log)

프로젝트 기획부터 개발, 배포 및 유지보수 전 단계를 아우르는 주요 변경 사항을 기록함.
각 변경 사항은 [버전명] - 날짜 형식으로 작성하며, 추가(Added), 수정(Changed), 제거(Removed), 수정/해결(Fixed) 등으로 분류함.

## [v1.0.0] - 2026-03-25

### Added

- `src/components/community/AnnouncementList.tsx` — Radix UI Accordion 기반 공지 아코디언 UI, 어드민 핀 고정/해제
- `src/components/community/MixsetFeedbackCard.tsx` — 믹스셋 리치 미디어 카드, HTML5 인라인 오디오 플레이어
- `src/components/ui/accordion.tsx` — Shadcn 스타일 Accordion 컴포넌트
- `src/components/ui/tabs.tsx` — Shadcn 스타일 Tabs 컴포넌트
- `drizzle/0003_community_board_type.sql` — posts 테이블 board_type/is_pinned/media_url 마이그레이션

### Changed

- `src/db/schema.ts` — posts 테이블에 boardType(ANNOUNCEMENT/GENERAL/FEEDBACK), isPinned, mediaUrl 컬럼 추가
- `src/lib/actions/posts.ts` — getPostsByBoardType(), togglePinPost() 추가; deletePost() category 파라미터 제거
- `src/app/community/CommunityClient.tsx` — 3탭 UI(공지/자유/믹스셋) 전면 재작성
- `src/app/community/new/page.tsx` — boardType 선택 탭 + FEEDBACK R2 오디오 업로드 UI 추가
- `src/app/community/[postId]/PostDetailClient.tsx` — deletePost 호출 시그니처 수정
- `src/app/globals.css` — accordion-down/up 애니메이션 keyframe 추가

### Fixed

- `PostDetailClient.tsx`: deletePost()에 category 파라미터 전달하던 코드 제거 (시그니처 불일치 해소)

### Dependencies

- `@radix-ui/react-accordion` 추가
- `@radix-ui/react-tabs` 추가

---

## [v0.9.0] - 2026-03-25

### Added

- `src/components/dashboard/ProfileCourseWidget.tsx` — 프로필 + 티어 뱃지 + 진도 바 위젯
- `src/components/dashboard/UpcomingLessonsWidget.tsx` — D-day 알림 + .ics 다운로드 위젯
- `src/components/dashboard/DiggingAnalyticsWidget.tsx` — Recharts BarChart 주간 트랙 통계 (목데이터)
- `src/components/dashboard/PendingQnaWidget.tsx` — Q&A 미답변 알림 위젯 (목데이터)
- `.docs/phases/PHASE_PROGRESS.md` — 고도화 단계별 진행 현황 추적 문서 신규 생성

### Changed

- `src/components/dashboard/ProgressCharts.tsx` — Recharts AreaChart 스파크라인 추가, 레이아웃 개선
- `src/app/dashboard/student/page.tsx` — 3컬럼 반응형 위젯 그리드 + 독립 Suspense 병렬 스트리밍
- `src/app/dashboard/admin/page.tsx` — 헤더 아이콘 추가, 반응형 개선
- `src/components/admin/StatsCards.tsx` — 이번 주 레슨 수/미답변 피드백 실데이터 연동, 아이콘 + 색상 체계 추가

### Dependencies

- `recharts` 추가

---

## [v0.8.0] - 2026-03-25

### Added

- `src/lib/r2.ts` — Cloudflare R2 S3 클라이언트 초기화, `generatePresignedUploadUrl()`, `deleteR2Object()` 구현
- `src/lib/actions/upload.ts` — Presigned URL 발급 서버 액션 (인증 검증 포함)
- `src/components/upload/FileUploader.tsx` — 범용 파일 업로드 컴포넌트 (진행률 표시, R2 직접 PUT)
- `src/modules/` — Feature-Sliced 디렉토리 구조 (auth/, digging/, calendar/, qna/) 초기 생성
- `src/app/community/CommunityClient.tsx` — 커뮤니티 페이지 클라이언트 컴포넌트 분리

### Changed

- `src/app/community/page.tsx` → RSC 래퍼 패턴으로 전환 (`force-dynamic`, 서버 액션 직접 임포트 제거)
- `src/app/layout.tsx` — `export const dynamic = "force-dynamic"` 추가 (인증 앱 전체 동적 렌더링)
- `src/pages/_document.tsx`, `_app.tsx`, `_error.tsx` 신규 생성 (App Router + Pages Router 공존 필수 파일)
- `next.config.ts` — `@cloudflare/next-on-pages/next-dev` 제거, ESLint 빌드 비활성화
- `.env.example` — R2 환경 변수 (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`) 추가

### Fixed

- `npm run build` 정적 생성 단계 `TypeError: Cannot read properties of undefined (reading 'env')` 해결 (RSC 래퍼 패턴 + force-dynamic 전환)
- `VideoPlayer.tsx` — `react-player` SSR 충돌 해결 (`dynamic()` ssr:false 로 전환)

---

## [v0.6.0] - 2026-03-24

### Changed

- Cloudflare 배포 어댑터를 `@cloudflare/next-on-pages` → `@opennextjs/cloudflare`로 전환함. (모든 라우트에 Edge Runtime 강제 선언 제거 가능, Node.js 호환성 확보)
- `package.json`의 빌드 스크립트를 `build:pages` → `build:worker`로 변경하여 OpenNext CLI를 직접 호출함
- `wrangler.toml`의 진입점을 `.vercel/output/static/_worker.js` → `.open-next/worker.js`로, 에셋 경로를 `.open-next/assets`로 변경함
- `open-next.config.ts` 파일 신규 추가 (OpenNext 빌더 최소 설정)
- `.gitignore`에 `.open-next/` 빌드 산출물 경로 추가

### Fixed

- 기존 배포 어댑터가 요구하던 모든 라우트 파일(SSR 페이지, API 라우트 등)에 `export const runtime = 'edge'` 강제 선언 문제 해소

---

## [v0.5.0] - 2026-03-24


### Changed

- `assignments/[id]/page.tsx` 등 다수의 Client Component 안티패턴을 Server Component 데이터 패칭 구조로 개편함 (Next.js 15 App Router 권장 패턴 적용)
- `admin/page.tsx`의 비대해진 로직을 `StatsCards`, `StudentRoster` 모듈로 분리하여(SoC) 유지보수성 향상함
- `next.config.ts`에 `serverExternalPackages: ["better-sqlite3", "bcryptjs"]`를 선언하여 서버/클라이언트 번들링 충돌 현상을 해결함

### Fixed

- 프로젝트 전역의 `any` 암시적 타입 할당 에러(map 파라미터 등)를 모두 명시적 타입으로 수정해 strict 모드 타입 안전성을 확보함
- `docker-compose.yml` 내부의 하드코딩된 `NODE_ENV=development`로 인해 Next.js 프로덕션 빌드 과정에서 `setupDevPlatform` 기반의 Edge 라우터 패치가 개입되어 발생하는 `<Html>` 렌더링 충돌 빌드 에러를 원천 차단함
- Client Component 내부의 `useSearchParams` 훅을 `Suspense` 바운더리로 래핑하여 PRERENDER_ERROR(CSR Bailout) 빌드 에러 현상을 수정함

---

## [v0.4.0] - 2026-03-10

### Added

- **Phase 1 — 학생 계정 관리**: `students.ts` 서버 액션(createStudent, getStudents, deleteStudent), `StudentCard` 컴포넌트, `/dashboard/admin/students/new` 폼 페이지, Admin Dashboard DB 연동(Suspense 스트리밍)
- **Phase 2 — 커리큘럼/레슨/캘린더**: `curriculum.ts`(createModule, toggleComplete), `lessons.ts`(createLesson), 학생 상세 페이지(`/admin/students/[id]`), Student Dashboard DB 연동, 커리큘럼 목록 페이지(진행률 바), `/api/calendar/[studentId]` `.ics` 파일 API
- **Phase 3 — 과제/피드백**: `assignments.ts`(submitAssignment, getMyAssignments), `feedbacks.ts`(createFeedback, MM:SS 파싱), `TimelineFeedback` 컴포넌트(타임스탬프 클릭→VideoPlayer seekTo), 과제 목록/상세 페이지, VideoPlayer `seekToSeconds` prop 리팩터
- **Phase 4 — 커뮤니티 게시판**: `posts.ts`/`comments.ts` CRUD 서버 액션, 커뮤니티 메인 페이지 전면 DB 연동(Sci-Fi 제거, 클린 테마), 게시물 상세/작성 페이지, 댓글 기능
- 사이드바 네비게이션 역할별 분기(Admin: Students, Community / Student: Curriculum, Assignments, Community)
- `ics` npm 패키지 설치

### Fixed

- `[student_id]` vs `[studentId]` dynamic route slug 충돌 해소(기존 목업 폴더 제거)

---

## [v0.3.0] - 2026-03-10

### Fixed

- 인증 미들웨어 미작동 결함 해결: `proxy.ts` → `middleware.ts`로 파일명 변경 (Next.js 파일 규약 준수)
- Docker 의존성 설치 누락 결함 해결: `docker-compose.yml`의 `command: npm run dev` 제거, Dockerfile CMD 복원
- Docker 환경변수 누락 해결: `env_file: .env.local` 추가로 `AUTH_SECRET` 등 환경변수 컨테이너에 정상 주입

### Changed

- Sci-Fi/neon 테마 잔존 요소 전면 정리: Orbitron 폰트, neon glow shadow, cyan grid 배경 제거
- `(as any)` 타입 캐스팅 전량 제거: `next-auth.d.ts` 타입 모듈 확장으로 `role` 필드 타입 안전화
- Dashboard 레이아웃 클린/미니멀 디자인으로 교체
- `auth.ts`: `(process.env as any).DB` → `getRequestContext().env.DB` Cloudflare 공식 패턴으로 교체
- `types/` 디렉토리 신설: `next-auth.d.ts`, `user.ts` 타입 선언 파일 추가

## [v0.2.0] - 2026-03-10

### Changed

- 기획 변경에 의한 백엔드 인프라 전면 교체 적용 완료 (Supabase -> Cloudflare D1/R2 마이그레이션)
- NextAuth.js (Auth.js v5) 및 Drizzle ORM 어댑터 연동으로 인증 로직 갱신함
- 전체 `.docs` 문서 시스템 (REQUIREMENTS.md 추가 등) 및 Task 체크리스트 최신화함

## [v0.1.0] - 2026-03-10

### Added

- Stann Lumo - DJ Lesson Portal 기획안 기반 프로젝트 설정 정의함
- `task.md` 및 `implementation_plan.md`를 포함한 프로젝트 초기 문서화 작성 완료
- M1 Mac 환경을 고려한 100% Docker 기반 전역 환경 지침(Global Prompt) 적용함
- `README.md`, `CHANGE_LOG.md`, `TROUBLESHOOTING.md` 등 코어 문서 생성 완료

### Changed

- (현재 단계에서 Supabase 기반 코드들은 삭제 후 v0.2.0으로 롤오버됨)
