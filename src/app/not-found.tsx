import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-3xl font-bold mb-4">404 - Not Found</h2>
      <p className="text-muted-foreground mb-8">찾으시는 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link href="/dashboard" className="text-primary hover:underline font-medium">
        대시보드로 돌아가기
      </Link>
    </div>
  );
}
