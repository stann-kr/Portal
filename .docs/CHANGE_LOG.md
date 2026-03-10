# 변경 이력 (Change Log)

프로젝트 기획부터 개발, 배포 및 유지보수 전 단계를 아우르는 주요 변경 사항을 기록함.
각 변경 사항은 [버전명] - 날짜 형식으로 작성하며, 추가(Added), 수정(Changed), 제거(Removed), 수정/해결(Fixed) 등으로 분류함.

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
