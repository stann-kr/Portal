# Stann Lumo - DJ Lesson Portal

## 1. 개요 (Overview)

본 프로젝트는 테크노 DJ 'Stann Lumo'의 개인 레슨을 위한 프라이빗 LMS(학습 관리 시스템)이자, 수강생 커뮤니티 공간(`portal.stann.com`)임.

## 2. 디자인 콘셉트 (Design Concept)

- **테마:** "Hypnotic, Futuristic, Sci-Fi"
- **색상:** 심해/다크 베이스에 네온 톤(Cyan, Acid Green 등)의 포인트 컬러 활용.

## 3. 핵심 기능 (Core Features)

- **인증 및 권한:** Supabase Auth, 이메일 및 Google 소셜 로그인 지원, Role(Admin/Student) 기반 접근 권한 관리.
- **피드백 시스템:** `react-player` 기반의 타임라인 코멘트 피드백 시스템. 지정된 타임스탬프 클릭 시 즉시 해당 구간 재생 지원.
- **캘린더 동기화:** Google Calendar API 연동 및 고유 `.ics` 파일을 통한 개인화된 일정 동기화.
- **커뮤니티 환승:** Tiptap WYSIWYG 에디터를 통한 리치 텍스트 작성 및 Supabase Realtime을 통한 실시간 토스트 알림.

## 4. 기술 스택 (Tech Stack)

- **Framework:** Next.js 15 (App Router, Server Actions)
- **BaaS:** Supabase (Auth, Database, Storage, Realtime)
- **Styling:** Tailwind CSS, Tailwind Merge, CLSX, Framer Motion
- **Editor:** Tiptap, DOMPurify
- **Utils:** react-player, googleapis, ics, date-fns

## 5. 로컬 개발 환경 (Development Setup)

본 프로젝트는 Apple Silicon 환경에서의 호환성과 독립성을 보장하기 위해 100% Docker 컨테이너 환경에서 구동됨. **로컬 터미널에서의 Node/npm 명령어 실행을 엄격히 금지함.**

### 컨테이너 실행

```bash
# 개발 서버 백그라운드 구동
docker compose up -d web

# 서버 로그 확인
docker compose logs -f web
```

### 패키지 관리

```bash
# 의존성 설치 (예: npm install dayjs)
docker compose run --rm web npm install <pkg>

# 일회성 스크립트 실행 (예: npx prisma migrate dev)
docker compose run --rm web npx <command>
```
