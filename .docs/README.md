# Stann Lumo — DJ Lesson Portal

> 테크노 DJ 'Stann Lumo'의 수강생 전용 프라이빗 LMS 및 커뮤니티 포털.
> [`portal.stann.com`](https://portal.stann.com)

---

## 개요 (Overview)

강사가 직접 학생 계정을 생성하고 커리큘럼·레슨을 관리하며, 학생은 믹스셋을 제출하고 타임스탬프 기반 피드백을 받는 프라이빗 LMS. 커뮤니티 게시판, 개인 캘린더, 디깅 보드, 1:1 프라이빗 노트, Q&A 게시판을 통한 수강생-강사 소통도 지원함.

---

## 핵심 기능 (Core Features)

| 기능              | 설명                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **인증 / 권한**   | Credentials(이메일+비밀번호) 기반 JWT 세션. Admin이 학생 계정 직접 생성. Role(Admin/Student)별 보호 라우트                      |
| **학생 관리**     | Admin 대시보드에서 학생 계정 CRUD, Student Roster 조회                                                                          |
| **커리큘럼 관리** | 학생별 주차 단위 모듈 등록, 학생 본인의 완료 토글, 진행률 표시                                                                  |
| **레슨 일정**     | 강사가 날짜·시간 지정 레슨 등록. 학생 전용 `.ics` URL로 모바일 캘린더 단방향 구독                                               |
| **과제 피드백**   | 학생이 YouTube/SoundCloud URL 제출 → 강사가 `MM:SS` 타임스탬프 기반 피드백 작성 → 클릭 시 해당 시점 즉시 재생                   |
| **커뮤니티**      | `gear-and-setup` / `track-id` / `terminal-info` / `general` 카테고리 게시판. TiptapEditor 리치 텍스트. 본인 글/댓글만 삭제 가능 |
| **개인 캘린더**   | FullCalendar 기반 이벤트 관리. 레슨 일정 자동 연동, 드래그앤드롭 리스케줄링, `.ics` 구독 URL 제공                               |
| **디깅 게시판**   | TanStack Table 기반 커스텀 컬럼 음악 트랙 관리. oEmbed(YouTube/SoundCloud) 메타 자동 추출, 별점/선호도 셀 지원                  |
| **1:1 프라이빗 노트** | Admin이 학생별 수업 노트 작성·관리. TiptapEditor 리치 텍스트, isomorphic-dompurify XSS 방어                               |
| **Q&A 게시판**    | 학생이 질문 스레드 생성 → 강사가 답변. OPEN / ANSWERED / CLOSED 상태 관리. Admin 전체 조회 가능                                 |

---

## 기술 스택 (Tech Stack)

| 분야               | 기술                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| **Framework**      | Next.js 15.3 (App Router, Server Actions)                             |
| **Auth**           | NextAuth.js v5 (Credentials Provider, JWT)                            |
| **Database**       | Cloudflare D1 (SQLite 기반) + Drizzle ORM                             |
| **Object Storage** | Cloudflare R2                                                         |
| **Styling**        | Tailwind CSS v4, Framer Motion — 클린/미니멀 라이트 테마 (Inter 폰트) |
| **Editor**         | Tiptap (WYSIWYG)                                                      |
| **Media Player**   | react-player (YouTube / SoundCloud)                                   |
| **Calendar**       | FullCalendar (인터랙티브 캘린더) + `ics` 라이브러리 (`.ics` 파일 생성) |
| **Table**          | TanStack Table v8 (디깅 게시판 커스텀 컬럼)                           |
| **Sanitization**   | isomorphic-dompurify (서버사이드 XSS 방어)                            |
| **Dev Env**        | 100% Docker (`linux/arm64`, Apple Silicon)                            |

---

## 데이터 모델 (Schema)

```
profiles        — 사용자 계정 (id, email, passwordHash, displayName, role)
curriculums     — 학생별 주차 모듈 (weekNum, title, isCompleted)
lessons         — 레슨 일정 (studentId, scheduledAt)
assignments     — 과제 제출 (studentId, mediaUrl)
feedbacks       — 타임스탬프 피드백 (assignmentId, timeMarker, content)
posts           — 커뮤니티 게시물 (authorId, category, title, contentHtml)
comments        — 게시물 댓글 (postId, authorId, contentHtml)
categories      — 커뮤니티 카테고리 (slug, name, sortOrder)
privateNotes    — 1:1 수업 노트 (studentId, authorId, title, contentHtml)
calendarEvents  — 개인 캘린더 이벤트 (userId, eventType, startTime, endTime)
diggingColumns  — 디깅 보드 컬럼 정의 (userId, columnType, name, sortOrder)
diggingTracks   — 디깅 보드 트랙 데이터 (userId, values JSON, linkUrl)
qnaThreads      — Q&A 스레드 (studentId, title, status)
qnaReplies      — Q&A 답변 (threadId, authorId, contentHtml)
```

---

## 라우트 구조 (Routes)

```
/login                                   — 로그인
/dashboard/admin                         — Admin 대시보드 (학생 목록, 통계)
/dashboard/admin/students/new            — 학생 계정 생성
/dashboard/admin/students/[id]           — 학생 상세 (커리큘럼·레슨 관리)
/dashboard/student                       — Student 대시보드 (현재 모듈, 다음 레슨)
/dashboard/student/curriculum            — 전체 커리큘럼 + 진행률
/dashboard/student/assignments           — 과제 목록 + 제출
/dashboard/student/assignments/[id]      — 과제 상세 (VideoPlayer + 타임라인 피드백)
/dashboard/student/digging               — 디깅 게시판 (본인 보드)
/dashboard/student/notes                 — 1:1 프라이빗 노트 목록
/dashboard/calendar                      — 개인 캘린더 (FullCalendar)
/dashboard/qna                           — Q&A 게시판 목록
/dashboard/qna/new                       — 새 질문 작성
/dashboard/qna/[threadId]                — 스레드 상세 + 답변
/community                               — 커뮤니티 (카테고리별 게시판)
/community/new                           — 게시물 작성
/community/[postId]                      — 게시물 상세 + 댓글
/api/calendar/[studentId]                — .ics 캘린더 파일 다운로드
```

---

## 로컬 개발 환경 (Development Setup)

**⚠️ 로컬 터미널에서 Node/npm 직접 실행 금지. 모든 명령어는 Docker를 통해 실행.**

### 개발 서버 실행

```bash
docker compose up          # 포어그라운드
docker compose up -d       # 백그라운드
docker compose logs -f web # 로그 확인
```

- **접속 주소**: [http://localhost:3004](http://localhost:3004)

### 패키지 관리

```bash
# 패키지 설치
docker compose run --rm web npm install <pkg>

# Drizzle 마이그레이션
docker compose run --rm web npx drizzle-kit migrate

# 일회성 스크립트
docker compose run --rm web npx <command>
```

### 환경 변수

`.env.local` 파일 생성 후 아래 변수 설정 (`.env.example` 참고):

```
AUTH_SECRET=
DATABASE_URL=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_DATABASE_ID=
```

---

## 문서 (Docs)

| 파일                                                         | 내용                         |
| ------------------------------------------------------------ | ---------------------------- |
| [REQUIREMENTS.md](./REQUIREMENTS.md)                         | 기능 요구사항 명세           |
| [CHANGE_LOG.md](./CHANGE_LOG.md)                             | 버전별 변경 이력             |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)                   | 트러블슈팅 이력              |
| [private/CLOUDFLARE_GUIDE.md](./private/CLOUDFLARE_GUIDE.md) | Cloudflare D1/R2 설정 가이드 |
