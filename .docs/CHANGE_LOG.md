# 변경 이력 (Change Log)

프로젝트 기획부터 개발, 배포 및 유지보수 전 단계를 아우르는 주요 변경 사항을 기록함.
각 변경 사항은 [버전명] - 날짜 형식으로 작성하며, 추가(Added), 수정(Changed), 제거(Removed), 수정/해결(Fixed) 등으로 분류함.

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
