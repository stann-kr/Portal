# 요구사항 명세 (Requirements Spec)

## 1. 개요

- 프로젝트명: Stann Lumo - DJ Lesson Portal
- 플랫폼 목표: 테크노 DJ 'Stann Lumo'의 개인 레슨 학습 방향 제시 및 수강생 커뮤니티 연결망 제공
- 인프라: 프론트엔드/백엔드 완전 분리형 Cloudflare 생태계(Cloudflare Pages, D1, R2, Workers) 활용

## 2. 주요 기능 및 요구사항 (명사형)

1. **사용자 권한 관리 및 인증**
   - 사용자 역할 분리: Admin(강사), Student(수강생).
   - 인증 방식: Credentials(이메일+비밀번호) 기반 JWT 세션 처리. 관리자가 직접 학생 계정 생성.
   - 접근 제어: 역할에 따른 보호 라우트 처리 및 데이터 접근 권한 분리.
2. **커리큘럼 및 캘린더 동기화**
   - 레슨 일정 관리 기능: 강사가 일정 등록.
   - 개인화된 캘린더 피드 제공: 수강생 전용 `.ics` URL 제공으로 모바일 캘린더 단방향 구독 가능.
3. **타임라인 기반 과제 피드백 시스템**
   - 과제 제출: 수강생의 믹스셋(YouTube, SoundCloud 링크) 등록.
   - 타임스탬프 코멘트: 강사의 특정 시간대(예: `15:45`) 기록 및 피드백 작성.
   - 상호작용: 타임스탬프 클릭 시 해당 시점 즉시 재생 기능.
4. **커뮤니티 (소통 채널)**
   - 카테고리별 게시판: `Gear & Setup`, `Track ID`, `Terminal Info`, `General` 등.
   - 리치 텍스트 에디터: WYSIWYG 형태의 글 작성 및 이미지, 미디어 임베드 기능.
   - 작성 및 조회 규칙: 누구나 열람 가능하며, 본인 글만 수정 및 삭제 허용.

## 3. 기술 스택 및 데이터 모델 제약

1. **프레임워크:** Next.js 15 (App Router).
2. **스타일링:** Tailwind CSS v4, Framer Motion. **클린/미니멀 라이트 테마** (Inter 폰트, 회색조 디자인 시스템).
3. **데이터베이스:** Cloudflare D1 (비동기 SQLite 기반).
4. **오브젝트 스토리지:** Cloudflare R2 (이미지 등 정적 파일 업로드용).
5. **백엔드 로직 (API):** Next.js Server Actions 및 필요 시 Cloudflare Workers 연동.
6. **서버 및 구동 환경:** Apple Silicon 로컬 환경에서의 100% Docker 지원 (`linux/arm64` 기반 Next.js 구동).
