# 트러블슈팅 이력 (Troubleshooting)

프로젝트 진행 중 발생하는 주요 버그, 아키텍처 결함, 및 Docker(M1/M2) 관련 환경 오류에 대한 원인 분석 및 해결 과정을 기록함.

## [v0.6.2] - 2026-03-24

### Fixed

- Cloudflare Workers 배포 시 `async_hooks`, `fs`, `path` 등 Node.js 내장 모듈을 찾지 못하는 오류 해결 (`compatibility_date`를 `2024-11-18`로 업데이트)
- `wrangler.toml`에 `name = "portal"`을 명시하여 CI 빌드 환경과의 일관성 확보

---

## [v0.6.1] - 2026-03-24

### Fixed
- [x] `walkthrough.md` 업데이트
- [x] Cloudflare 빌드 환경 NPM 의존성 충돌(ERESOLVE) 및 Lockfile 불일치(EUSAGE) 해결을 위해 `.npmrc`(`legacy-peer-deps=true`) 설정 추가
- Next.js 버전 패치 (`15.3.2` → `15.3.9`)를 통해 보안 취약점 해결 및 OpenNext peer dependency 대등화

---

## [v0.6.0] - 2026-03-24]

### 1. [배포] `Could not resolve "async_hooks"` 등 Node.js 내장 모듈 에러

- **문제 현상 (Symptom)**: OpenNext 빌드 완료 후 `npx wrangler versions upload` 단계에서 `fs`, `path`, `crypto`, `async_hooks` 등 Node.js 빌트인 패키지를 해석하지 못해 배포 실패.
- **원인 분석 (Root Cause)**: Cloudflare Workers의 `compatibility_date`가 구형(`2024-03-20`)인 경우, 최신 Node.js 호환성 기능(플래그 없이 `node:` 접두사 해석 등)이 활성화되지 않음.
- **해결 방법 (Solution)**: `wrangler.toml`의 `compatibility_date`를 `2024-11-18` (또는 그 이상)으로 업데이트하여 런타임이 Node.js 내장 모듈을 자동으로 처리하도록 설정.

### 2. [NPM 설치] `EUSAGE` (Lockfile out of sync) 에러

- **문제 현상 (Symptom)**: Cloudflare 빌드 환경의 `npm ci` 단계에서 `package.json`과 `package-lock.json`이 일치하지 않아 `EUSAGE` 에러 발생. (예: `eslint-config-next@15.3.2 does not satisfy @15.3.9`)
- **원인 분석 (Root Cause)**: `package.json`의 버전을 수동으로 수정하거나 `npm install` 없이 커밋할 경우, `npm ci`는 무결성 검사를 위해 설치를 중단함.
- **해결 방법 (Solution)**: 로컬 Docker 컨테이너 내부에서 `npm install --legacy-peer-deps`를 실행하여 `package-lock.json`을 강제로 동기화한 후 커밋/푸시함.

### 2. [NPM 설치] `ERESOLVE` 의존성 충돌 에러

- **문제 현상 (Symptom)**: Cloudflare 빌드 환경의 `npm clean-install` (npm ci) 단계에서 `@opennextjs/cloudflare`와 `next` 버전 간의 Peer Dependency 불일치로 인해 `ERESOLVE` 에러 발생 및 빌드 중단.
- **원인 분석 (Root Cause)**: `@opennextjs/cloudflare@1.17.3` 버전이 요구하는 `next` 버전 범위에 프로젝트의 `15.3.2`가 포함되지 않아 발생. `npm ci`는 `npm install`보다 엄격하게 의존성을 검사함.
- **해결 방법 (Solution)**:
  1. `.npmrc` 파일에 `legacy-peer-deps=true` 설정을 추가하여 빌드 환경에서의 엄격한 Peer Dep 검사 우회.
  2. `next` 및 `eslint-config-next` 버전을 `15.3.9`로 업데이트하여 요구 사양 충족 및 보안 취약점 해결.

### 2. [프로덕션 빌드] `@cloudflare/next-on-pages`의 Edge Runtime 강제 에러

- **문제 현상 (Symptom)**: `npx @cloudflare/next-on-pages` 빌드 시, Node.js 런타임을 사용하는 모든 API 및 SSR 페이지에 대해 `export const runtime = 'edge'` 선언이 누락되었다는 에러와 함께 빌드 실패.
- **원인 분석 (Root Cause)**: 해당 빌더는 모든 서버 로직을 Edge Function으로만 변환할 수 있는 구조적 한계가 있어, 복잡한 Node.js 의존성이 있는 앱 전체를 수동으로 Edge로 전환해야 하는 유지 보수 부채가 발생함.
- **해결 방법 (Solution)**: Cloudflare의 새로운 권장 솔루션인 **OpenNext (`@opennextjs/cloudflare`)**로 전환함. `wrangler.toml`의 진입점을 `.open-next/worker.js`로 변경하고 `nodejs_compat` 플래그를 활용하여 별도의 Edge 선언 없이도 안정적인 배포 환경을 수립함.

### 2. [프로덕션 빌드] `<Html> should not be imported` 내부 충돌 에러

- **문제 현상 (Symptom)**: `docker compose run --rm web npm run build` (프로덕션 빌드) 단계에서 `Error: <Html> should not be imported outside of pages/_document.` 라는 App Router 호환성 충돌 에러가 발생하며 `/404` 페이지 렌더링에 실패함.
- **원인 분석 (Root Cause)**: `docker-compose.yml`에 전역으로 `NODE_ENV=development`가 하드코딩되어 있어, `next build` 상황에서도 `next.config.ts` 내부의 `setupDevPlatform` 매크로가 불필요하게 실행됨. 이로 인해 프로덕션 컴파일러 내부에 dev 환경용 Edge Router 목업이 섞이면서 Next.js 내부 페이지 라우터 엔진(에러 폴백 구동기)이 붕괴되어 에러를 반환함.
- **해결 방법 (Solution)**: Docker Compose의 빌드 커맨드 실행 시 `-e NODE_ENV=production` 플래그를 오버라이드하여 프로덕션 빌드 환경 변수를 정상화함으로써, 개발자 도구가 번들에 개입하지 차단함 (`docker compose run --rm -e NODE_ENV=production web npm run build`).

### 2. [프로덕션 빌드] `missing-suspense-with-csr-bailout` 에러

- **문제 현상 (Symptom)**: `new/page.tsx` 등 다수 컴포넌트 빌드 시 `useSearchParams() should be wrapped in a suspense boundary` 렌더링 실패 발생.
- **원인 분석 (Root Cause)**: Next.js 15 App Router 규약상, Client Component 내부에서 `useSearchParams` 훅이 최상단 렌더 트리에 직접 사용될 경우, 빌드(SSG) 단계에서 쿼리 파라미터를 식별하지 못해 정적 렌더 최적화가 포기(Bailout)되는 문제가 발생함.
- **해결 방법 (Solution)**: 쿼리 파라미터 의존성이 있는 핵심 로직(`NewPostForm`)을 별도의 내부 컴포넌트로 분리한 뒤, 부모 `Page` 컴포넌트에서는 `<Suspense>`로 래핑하여 Hydration 충돌을 방지하고 정적 렌더링을 가능하게 조치함.

---

## [2026-03-10]

### 1. CallbackRouteError — setupDevPlatform D1 바인딩 미주입

- **문제 현상 (Symptom)**: 로그인 시도 시 `CallbackRouteError` 발생. 로그에 `Error: D1 Database binding not found` 출력.
- **원인 분석 (Root Cause)**:
  1. `@cloudflare/next-on-pages`의 `setupDevPlatform()`은 내부적으로 `shouldSetupContinue()`를 호출하며, 이 함수는 `globalThis.AsyncLocalStorage` 존재 여부로 실행 여부를 결정함. Node.js 기본 환경에서는 `globalThis`에 없어 **setup 자체가 스킵**됨.
  2. `setup`이 실행되더라도 `vm.runInContext` 패치 방식으로 바인딩을 주입하는데, **Next.js 15 RSC Server Action 컨텍스트에서는 해당 패치가 전파되지 않아** `process.env.DB`가 `undefined`로 남음.
- **해결 방법 (Solution)**:
  - `db/client.ts`에 개발 환경 전용 폴백 구현:
    - D1 바인딩 없을 때 `process.env.NODE_ENV === "development"` 분기에서 Wrangler가 저장한 로컬 SQLite 파일(`.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`)을 `better-sqlite3` + `drizzle-orm/better-sqlite3`로 직접 접근.
  - `better-sqlite3`, `@types/better-sqlite3` 의존성 추가.
  - `setupDevPlatform()` 의존 제거로 로컬 개발 환경 안정화.

### 2. Wrangler 로컬 구동 시 "symbol not found" 및 바이너리 호환성 오류

- **문제 현상 (Symptom)**: `wrangler` 실행 시 `workerd` 바이너리 로드 실패 혹은 `fcntl64: symbol not found` 에러 발생.
- **원인 분석 (Root Cause)**: `node:20-alpine` 이미지는 `musl` libc를 사용하나, Cloudflare의 `workerd` 엔진은 `glibc` 기반으로 빌드되어 Alpine 환경과 호환되지 않음.
- **해결 방법 (Solution)**: `Dockerfile`의 베이스 이미지를 `node:20-bookworm-slim` (Debian 계열)으로 교체하여 `glibc` 환경을 확보함.

### 3. "wrangler: not found" 및 "next: not found" 실행 경로 오류

- **문제 현상 (Symptom)**: `npm run dev` 혹은 `wrangler` 호출 시 커맨드를 찾을 수 없다는 에러 발생.
- **원인 분석 (Root Cause)**:
  1. 컨테이너 내부 `PATH`에 로컬 `node_modules/.bin`이 정상적으로 포함되지 않음.
  2. `docker-compose`의 익명 볼륨 설정으로 인해 호스트의 `node_modules`가 컨테이너 기동 시마다 덮어씌워지거나 유실됨.
- **해결 방법 (Solution)**:
  1. `package.json` 스크립트에서 `wrangler`, `drizzle-kit` 등 모든 바이너리 호출 앞에 `npx`를 명시하여 실행 경로를 강제함.
  2. `docker-compose.yml`의 볼륨 설정을 **네임드 볼륨(Named Volume)**으로 전환하여 `node_modules`가 컨테이너 재시작 후에도 유지되도록 보장함.

### 4. 포트 할당 충돌 (Port is already allocated)

- **문제 현상 (Symptom)**: `./dev.sh dev` 실행 시 `Bind for 0.0.0.0:8788 failed` 에러 발생.
- **원인 분석 (Root Cause)**: 이전 실행 프로세스가 정상적으로 종료되지 않았거나, 다른 컨테이너가 동일한 포트를 점유 중임.
- **해결 방법 (Solution)**: `docker compose down` 명령으로 기존 컨테이너 및 네트워크 리소스를 완전히 정리한 후 재기동함.

### 5. Wrangler 로컬 서버 기동 시 Next.js 렌더링 및 Proxy 경고

- **문제 현상 (Symptom)**: `./dev.sh dev` 실행 시 `Specifying a -- <command> or --proxy is deprecated` 라는 Wrangler 경고와 함께 `The "middleware" file convention is deprecated` 형식의 오탐 렌더링 에러/크래시가 발생.
- **원인 분석 (Root Cause)**: 과거 방식인 `wrangler pages dev --proxy` 커맨드가 더 이상 권장되지 않으며, Next.js의 출력을 Wrangler가 가로채면서(proxy) 잘못된 형식으로 출력하여 오탐지 경고와 크래시 유발함.
- **해결 방법 (Solution)**:
  1. `next.config.ts` 파일 최상단에 `@cloudflare/next-on-pages/next-dev`의 `setupDevPlatform()`을 주입.
  2. `package.json` 및 `dev.sh`에서 `wrangler pages dev` 명령어를 완전히 제거하고, 순수 `next dev` 명령어로 구동하도록 변경. (이때 Cloudflare D1/R2 바인딩이 Next.js에 자동으로 주입됨)
  3. 로컬 구동 포트가 `8788`에서 Next.js 기본 포트인 `3000`으로 변경됨.

### 6. Next.js 기본 폰트(Geist) 유실 에러

- **문제 현상 (Symptom)**: `Can't resolve './fonts/GeistMonoVF.woff'` 에러와 함께 빌드/실행 실패.
- **원인 분석 (Root Cause)**: Next.js 기본 탬플릿의 로컬 폰트 파일이 프로젝트 구조에서 누락됨.
- **해결 방법 (Solution)**: `src/app/layout.tsx`에서 로컬 폰트(`next/font/local`) 대신 Google Fonts(`next/font/google`)인 **Inter**와 **Orbitron**(Sci-Fi 컨셉)으로 교체하여 외부 의존성 없이 안정적으로 렌더링되도록 수정함.

### 7. dev.sh 실행 시 Syntax Error

- **문제 현상 (Symptom)**: `./dev.sh: line 31: syntax error near unexpected token ';;'` 발생.
- **원인 분석 (Root Cause)**: 파일 편집 과정에서 보이지 않는 제어 문자나 잘못된 Case 문법이 삽입됨.
- **해결 방법 (Solution)**: `dev.sh` 파일을 인코딩 문제를 방지하기 위해 완전히 새로 작성하고 권한을 재부여함.

### 8. NextAuth.js (v5) MissingSecret 에러 및 환경변수 주입

- **문제 현상 (Symptom)**: NextAuth 구동 시 `[auth][error] MissingSecret: Please define a secret` 에러 발생.
- **원인 분석 (Root Cause)**: NextAuth v5부터 암호화를 위해 보안 해시 키(`AUTH_SECRET`)가 `.env.local` 등 환경 변수에 필수로 요구됨.
- **해결 방법 (Solution)**: 난수 형식의 해시 키를 생성하여 `.env.local` 파일에 주입하여 에러를 원천 차단함.

### 9. Node.js 런타임에서의 D1 바인딩 에러 (seed_admin.ts)

- **문제 현상 (Symptom)**: 로컬 `tsx seed_admin.ts` 스크립트 실행 중 `TypeError: Cannot read properties of undefined (reading 'prepare')` 발생.
- **원인 분석 (Root Cause)**: Cloudflare 의존성이 있는 Drizzle D1Adapter는 로컬 Node.js 런타임(`tsx`)에서 `env.DB` 객체를 인식하지 못해 연결에 실패함.
- **해결 방법 (Solution)**: `bcryptjs` 해시값만 생성한 뒤, Cloudflare 공식 로컬 정규 쿼리 명령인 `wrangler d1 execute portal-db --local`을 활용해 계정을 추가함.

### 10. 인증 미들웨어 전혀 동작하지 않음 (proxy.ts → middleware.ts)

- **문제 현상 (Symptom)**: 로그인 없이 `/dashboard` 경로에 직접 접근 가능. 인증 리다이렉트 미작동.
- **원인 분석 (Root Cause)**: Next.js App Router는 `src/middleware.ts` (또는 루트 `middleware.ts`) 파일만 미들웨어로 인식. 당시 파일명이 `proxy.ts`로 잘못 작성되어 미들웨어 자체가 로드되지 않음.
- **해결 방법 (Solution)**: `proxy.ts` 삭제 후 `src/middleware.ts`로 내용 이전.

### 11. Docker 컨테이너 기동 시 npm install 건너뜀

- **문제 현상 (Symptom)**: 컨테이너 기동 시 `node_modules` 폴더 누락 또는 패키지 not found 오류 반복 발생.
- **원인 분석 (Root Cause)**: `docker-compose.yml`에 `command: npm run dev`가 명시되어 Dockerfile의 `CMD npm install && npm run dev`를 완전히 덮어씀. 결과적으로 `npm install`이 실행되지 않음.
- **해결 방법 (Solution)**: `docker-compose.yml`에서 `command` 키 제거. Dockerfile의 CMD가 그대로 실행되도록 복원.

### 12. AUTH_SECRET 미인식으로 인한 NextAuth MissingSecret 재발

- **문제 현상 (Symptom)**: `.env.local`에 `AUTH_SECRET`이 정의되어 있음에도 컨테이너 내부에서 미인식되어 `[auth][error] MissingSecret` 반복 발생.
- **원인 분석 (Root Cause)**: `docker-compose.yml`에 `env_file` 설정이 없어 로컬 `.env.local`이 Docker 컨테이너에 전달되지 않음.
- **해결 방법 (Solution)**: `docker-compose.yml`의 `web` 서비스에 `env_file: - .env.local` 추가.
