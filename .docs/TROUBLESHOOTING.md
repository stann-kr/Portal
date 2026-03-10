# 트러블슈팅 이력 (Troubleshooting)

프로젝트 진행 중 발생하는 주요 버그, 아키텍처 결함, 및 Docker(M1/M2) 관련 환경 오류에 대한 원인 분석 및 해결 과정을 기록함.

## 1. Wrangler 로컬 구동 시 "symbol not found" 및 바이너리 호환성 오류

- **문제 현상 (Symptom)**: `wrangler` 실행 시 `workerd` 바이너리 로드 실패 혹은 `fcntl64: symbol not found` 에러 발생.
- **원인 분석 (Root Cause)**: `node:20-alpine` 이미지는 `musl` libc를 사용하나, Cloudflare의 `workerd` 엔진은 `glibc` 기반으로 빌드되어 Alpine 환경과 호환되지 않음.
- **해결 방법 (Solution)**: `Dockerfile`의 베이스 이미지를 `node:20-bookworm-slim` (Debian 계열)으로 교체하여 `glibc` 환경을 확보함.

## 2. "wrangler: not found" 및 "next: not found" 실행 경로 오류

- **문제 현상 (Symptom)**: `npm run dev` 혹은 `wrangler` 호출 시 커맨드를 찾을 수 없다는 에러 발생.
- **원인 분석 (Root Cause)**:
  1. 컨테이너 내부 `PATH`에 로컬 `node_modules/.bin`이 정상적으로 포함되지 않음.
  2. `docker-compose`의 익명 볼륨 설정으로 인해 호스트의 `node_modules`가 컨테이너 기동 시마다 덮어씌워지거나 유실됨.
- **해결 방법 (Solution)**:
  1. `package.json` 스크립트에서 `wrangler`, `drizzle-kit` 등 모든 바이너리 호출 앞에 `npx`를 명시하여 실행 경로를 강제함.
  2. `docker-compose.yml`의 볼륨 설정을 **네임드 볼륨(Named Volume)**으로 전환하여 `node_modules`가 컨테이너 재시작 후에도 유지되도록 보장함.

## 3. 포트 할당 충돌 (Port is already allocated)

- **문제 현상 (Symptom)**: `./dev.sh dev` 실행 시 `Bind for 0.0.0.0:8788 failed` 에러 발생.
- **원인 분석 (Root Cause)**: 이전 실행 프로세스가 정상적으로 종료되지 않았거나, 다른 컨테이너가 동일한 포트를 점유 중임.
- **해결 방법 (Solution)**: `docker compose down` 명령으로 기존 컨테이너 및 네트워크 리소스를 완전히 정리한 후 재기동함.

---

## 4. Wrangler 로컬 서버 기동 시 Next.js 렌더링 및 Proxy 경고

- **문제 현상 (Symptom)**: `./dev.sh dev` 실행 시 `Specifying a -- <command> or --proxy is deprecated` 라는 Wrangler 경고와 함께 `The "middleware" file convention is deprecated` 형식의 오탐 렌더링 에러/크래시가 발생.
- **원인 분석 (Root Cause)**: 과거 방식인 `wrangler pages dev --proxy` 커맨드가 더 이상 권장되지 않으며, Next.js의 출력을 Wrangler가 가로채면서(proxy) 잘못된 형식으로 출력하여 오탐지 경고와 크래시 유발함.
- **해결 방법 (Solution)**:
  1. `next.config.ts` 파일 최상단에 `@cloudflare/next-on-pages/next-dev`의 `setupDevPlatform()`을 주입.
  2. `package.json` 및 `dev.sh`에서 `wrangler pages dev` 명령어를 완전히 제거하고, 순수 `next dev` 명령어로 구동하도록 변경. (이때 Cloudflare D1/R2 바인딩이 Next.js에 자동으로 주입됨)
  3. 로컬 구동 포트가 `8788`에서 Next.js 기본 포트인 `3000`으로 변경됨.

## 5. Next.js 기본 폰트(Geist) 유실 에러

- **문제 현상 (Symptom)**: `Can't resolve './fonts/GeistMonoVF.woff'` 에러와 함께 빌드/실행 실패.
- **원인 분석 (Root Cause)**: Next.js 기본 탬플릿의 로컬 폰트 파일이 프로젝트 구조에서 누락됨.
- **해결 방법 (Solution)**: `src/app/layout.tsx`에서 로컬 폰트(`next/font/local`) 대신 Google Fonts(`next/font/google`)인 **Inter**와 **Orbitron**(Sci-Fi 컨셉)으로 교체하여 외부 의존성 없이 안정적으로 렌더링되도록 수정함.

## 6. dev.sh 실행 시 Syntax Error

- **문제 현상 (Symptom)**: `./dev.sh: line 31: syntax error near unexpected token ';;'` 발생.
- **원인 분석 (Root Cause)**: 파일 편집 과정에서 보이지 않는 제어 문자나 잘못된 Case 문법이 삽입됨.
- **해결 방법 (Solution)**: `dev.sh` 파일을 인코딩 문제를 방지하기 위해 완전히 새로 작성하고 권한을 재부여함.

## 7. NextAuth.js (v5) MissingSecret 에러 및 환경변수 주입

- **문제 현상 (Symptom)**: NextAuth 구동 시 `[auth][error] MissingSecret: Please define a secret` 에러 발생.
- **원인 분석 (Root Cause)**: NextAuth v5부터 암호화를 위해 보안 해시 키(`AUTH_SECRET`)가 `.env.local` 등 환경 변수에 필수로 요구됨.
- **해결 방법 (Solution)**: 난수 형식의 해시 키를 생성하여 `.env.local` 파일에 주입하여 에러를 원천 차단함.

## 8. Node.js 런타임에서의 D1 바인딩 에러 (seed_admin.ts)

- **문제 현상 (Symptom)**: 로컬 `tsx seed_admin.ts` 스크립트 실행 중 `TypeError: Cannot read properties of undefined (reading 'prepare')` 발생.
- **원인 분석 (Root Cause)**: Cloudflare 의존성이 있는 Drizzle D1Adapter는 로컬 Node.js 런타임(`tsx`)에서 `env.DB` 객체를 인식하지 못해 연결에 실패함.
- **해결 방법 (Solution)**: `bcryptjs` 해시값만 생성한 뒤, Cloudflare 공식 로컬 쿼리 명령인 `wrangler d1 execute portal-db --local`을 활용해 계정을 안전하게 삽입함.

---

## 9. 인증 미들웨어 전혀 동작하지 않음 (proxy.ts → middleware.ts)

- **문제 현상 (Symptom)**: 로그인 없이 `/dashboard` 경로에 직접 접근 가능. 인증 리다이렉트 미작동.
- **원인 분석 (Root Cause)**: Next.js App Router는 `src/middleware.ts` (또는 루트 `middleware.ts`) 파일만 미들웨어로 인식. 당시 파일명이 `proxy.ts`로 잘못 작성되어 미들웨어 자체가 로드되지 않음.
- **해결 방법 (Solution)**: `proxy.ts` 삭제 후 `src/middleware.ts`로 내용 이전.

## 10. Docker 컨테이너 기동 시 npm install 건너뜀

- **문제 현상 (Symptom)**: 컨테이너 기동 시 `node_modules` 폴더 누락 또는 패키지 not found 오류 반복 발생.
- **원인 분석 (Root Cause)**: `docker-compose.yml`에 `command: npm run dev`가 명시되어 Dockerfile의 `CMD npm install && npm run dev`를 완전히 덮어씀. 결과적으로 `npm install`이 실행되지 않음.
- **해결 방법 (Solution)**: `docker-compose.yml`에서 `command` 키 제거. Dockerfile의 CMD가 그대로 실행되도록 복원.

## 11. AUTH_SECRET 미인식으로 인한 NextAuth MissingSecret 재발

- **문제 현상 (Symptom)**: `.env.local`에 `AUTH_SECRET`이 정의되어 있음에도 컨테이너 내부에서 미인식되어 `[auth][error] MissingSecret` 반복 발생.
- **원인 분석 (Root Cause)**: `docker-compose.yml`에 `env_file` 설정이 없어 로컬 `.env.local`이 Docker 컨테이너에 전달되지 않음.
- **해결 방법 (Solution)**: `docker-compose.yml`의 `web` 서비스에 `env_file: - .env.local` 추가.

---

## 12. CallbackRouteError — setupDevPlatform D1 바인딩 미주입

- **문제 현상 (Symptom)**: 로그인 시도 시 `CallbackRouteError` 발생. 로그에 `Error: D1 Database binding not found` 출력.
- **원인 분석 (Root Cause)**:
  1. `@cloudflare/next-on-pages`의 `setupDevPlatform()`은 내부적으로 `shouldSetupContinue()`를 호출하며, 이 함수는 `globalThis.AsyncLocalStorage` 존재 여부로 실행 여부를 결정함. Node.js 기본 환경에서는 `globalThis`에 없어 **setup 자체가 스킵**됨.
  2. `setup`이 실행되더라도 `vm.runInContext` 패치 방식으로 바인딩을 주입하는데, **Next.js 15 RSC Server Action 컨텍스트에서는 해당 패치가 전파되지 않아** `process.env.DB`가 `undefined`로 남음.
- **해결 방법 (Solution)**:
  - `db/client.ts`에 개발 환경 전용 폴백 구현:
    - D1 바인딩 없을 때 `process.env.NODE_ENV === "development"` 분기에서 Wrangler가 저장한 로컬 SQLite 파일(`.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`)을 `better-sqlite3` + `drizzle-orm/better-sqlite3`로 직접 접근.
  - `better-sqlite3`, `@types/better-sqlite3` 의존성 추가.
  - `setupDevPlatform()` 의존 제거로 로컬 개발 환경 안정화.
