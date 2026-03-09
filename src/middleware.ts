import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 모든 요청 경로에 대해 미들웨어 검증을 실행하되, 아래 정적 리소스는 제외함:
     * - _next/static (빌드된 JS/CSS 정적 파일)
     * - _next/image (이미지 최적화 결과물)
     * - favicon.ico (파비콘)
     * - 외부 이미지 및 리소스 확장자 목록
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
