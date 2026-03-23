# 요구사항 명세 (Requirements Spec)

## 1. 개요

- **프로젝트명:** Stann Lumo — DJ Lesson Portal
- **플랫폼 목표:** 테크노 DJ 'Stann Lumo'의 개인 레슨 수강생을 위한 프라이빗 LMS 및 커뮤니티 포털 제공
- **인프라:** Cloudflare 생태계(Pages, D1, R2, Workers) 기반 풀스택 Next.js 앱

---

## 2. 주요 기능 및 요구사항

### 2-1. 사용자 권한 관리 및 인증 ✅ 구현 완료

- 사용자 역할 분리: `Admin`(강사), `Student`(수강생)
- 인증 방식: Credentials(이메일+비밀번호) 기반 NextAuth.js JWT 세션
- 계정 생성: Admin이 직접 학생 계정 생성 (소셜 로그인 없음)
- 접근 제어: 역할별 보호 라우트 (미들웨어 + 페이지 내 세션 검증)

### 2-2. 학생 계정 관리 ✅ 구현 완료

- Admin의 학생 계정 CRUD (생성·조회·삭제)
- Admin 대시보드 Student Roster: 이름·이메일·가입일 표시
- Active Students 카운트 통계 카드

### 2-3. 커리큘럼 및 캘린더 ✅ 구현 완료

- 학생별 주차 단위 커리큘럼 모듈 등록/삭제 (Admin)
- 학생 본인의 모듈 완료 토글 및 진행률 표시
- 레슨 일정 등록/삭제 (Admin), 다음 예정 레슨 조회 (Student)
- 학생 전용 `.ics` URL 제공: 모바일 캘린더 단방향 구독 (`/api/calendar/[studentId]`)

### 2-4. 타임라인 기반 과제 피드백 시스템 ✅ 구현 완료

- 과제 제출: 학생의 믹스셋 URL(YouTube / SoundCloud) 등록
- 타임스탬프 코멘트: 강사의 `MM:SS` 형식 피드백 작성
- 상호작용: 타임스탬프 클릭 시 VideoPlayer의 해당 시점 즉시 재생

### 2-5. 커뮤니티 (소통 채널) ✅ 구현 완료

- 카테고리별 게시판: `gear-and-setup`, `track-id`, `terminal-info`, `general`
- 리치 텍스트 에디터: TiptapEditor (WYSIWYG)
- 권한: 모든 인증 사용자 열람 가능. 본인 글/댓글만 삭제 허용 (Admin은 전체 삭제 가능)

---

## 3. 기술 스택 및 데이터 모델 제약

| 항목               | 내용                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| **Framework**      | Next.js 15.3 (App Router, Server Actions)                                         |
| **Auth**           | NextAuth.js v5 — Credentials Provider, JWT 세션                                   |
| **Database**       | Cloudflare D1 (SQLite) + Drizzle ORM                                              |
| **Object Storage** | Cloudflare R2 (이미지 등 정적 파일)                                               |
| **Styling**        | Tailwind CSS v4, Framer Motion — **클린/미니멀 라이트 테마** (Inter 폰트, 회색조) |
| **Editor**         | Tiptap                                                                            |
| **Media**          | react-player                                                                      |
| **Calendar**       | `ics` 라이브러리                                                                  |
| **Dev Env**        | Apple Silicon Mac, 100% Docker (`linux/arm64`)                                    |

---

## 4. 데이터 모델 (DB Schema)

| 테이블        | 주요 컬럼                                                      |
| ------------- | -------------------------------------------------------------- |
| `profiles`    | id, email, passwordHash, displayName, role(`admin`\|`student`) |
| `curriculums` | id, studentId, weekNum, title, isCompleted                     |
| `lessons`     | id, studentId, scheduledAt                                     |
| `assignments` | id, studentId, mediaUrl                                        |
| `feedbacks`   | id, assignmentId, timeMarker(초), content                      |
| `posts`       | id, authorId, category, title, contentHtml                     |
| `comments`    | id, postId, authorId, contentHtml                              |

---

## 5. 추가 개발 예정 (Phase 5)

- 프로필 이미지 / 비밀번호 변경 (본인)
- 알림 시스템 (새 피드백·레슨·게시물)
- Cloudflare R2 이미지 업로드 통합
- 대시보드 차트 (커리큘럼 완료율, 레슨 히스토리)
- 모바일 완전 반응형 최적화
