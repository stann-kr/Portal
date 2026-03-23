import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * NextAuth 에러 코드 → 사용자 친화적 메시지 매핑
 */
function getErrorMessage(error: string | undefined): string | null {
  if (!error) return null;
  const map: Record<string, string> = {
    CredentialsSignin: "이메일 또는 비밀번호가 올바르지 않습니다.",
    Configuration: "서버 설정 오류가 발생했습니다. 관리자에게 문의하세요.",
    AccessDenied: "접근 권한이 없습니다.",
    Verification: "인증 링크가 만료되었습니다.",
    Default: "로그인 중 오류가 발생했습니다. 다시 시도해 주세요.",
  };
  return map[error] ?? `알 수 없는 오류 (${error})`;
}

/**
 * @file src/app/(auth)/login/page.tsx
 * @description 로그인 페이지.
 * NextAuth `searchParams.error`를 읽어 실패 사유를 사용자에게 표시.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* 헤더 */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Portal Access
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your credentials to continue.
          </p>
        </div>

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive font-medium text-center">
            {errorMessage}
          </div>
        )}

        {/* 로그인 폼 */}
        <form
          action={async (formData: FormData) => {
            "use server";
            try {
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirectTo: callbackUrl ?? "/dashboard",
              });
            } catch (err) {
              if (err instanceof AuthError) {
                // NextAuth 에러는 URL 파라미터로 리다이렉트하여 사용자에게 표시
                redirect(`/login?error=${err.type}`);
              }
              // Next.js redirect()는 내부적으로 throw를 사용하므로 반드시 re-throw
              throw err;
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>Contact the administrator for account access.</p>
        </div>
      </div>
    </div>
  );
}
