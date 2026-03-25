/**
 * @file src/app/dashboard/student/digging/page.tsx
 * @description 학생 개인 디깅 게시판 페이지 (Phase 5).
 */
export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Disc3 } from "lucide-react";
import { getOrSeedColumns, getDiggingTracks } from "@/lib/actions/digging";
import { DiggingBoard } from "@/components/digging/DiggingBoard";
import type { DiggingColumnType } from "@/db/schema";

type RawColumn = Awaited<ReturnType<typeof getOrSeedColumns>>[number];

export default async function StudentDiggingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id!;
  const [columns, tracks] = await Promise.all([
    getOrSeedColumns(userId),
    getDiggingTracks(userId),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Disc3 className="w-6 h-6 text-primary" />
          My Digging
        </h1>
        <p className="text-sm text-muted-foreground">
          발견한 트랙을 기록하고 날짜별로 디깅 히스토리를 확인하세요.
        </p>
      </div>

      <DiggingBoard
        initialColumns={columns.map((c: RawColumn) => ({
          id: c.id,
          name: c.name,
          columnType: c.columnType as DiggingColumnType,
          options: c.options,
          isDefault: c.isDefault ?? false,
          sortOrder: c.sortOrder ?? 0,
        }))}
        initialTracks={tracks}
      />
    </div>
  );
}
