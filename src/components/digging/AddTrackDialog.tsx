/**
 * @file src/components/digging/AddTrackDialog.tsx
 * @description 트랙 추가 다이얼로그.
 * 링크 붙여넣기 → fetchLinkMeta로 트랙명/아티스트 자동 채움.
 */
"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDiggingTrack, fetchLinkMeta } from "@/lib/actions/digging";
import { StarRating } from "./StarRating";
import { CamelotPicker } from "./CamelotPicker";
import type { DiggingColumnType } from "@/db/schema";

type Column = {
  id: string;
  name: string;
  columnType: DiggingColumnType;
  options: string | null | undefined;
};

interface AddTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Column[];
  onSuccess: () => void;
}

export function AddTrackDialog({
  open,
  onOpenChange,
  columns,
  onSuccess,
}: AddTrackDialogProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [linkUrl, setLinkUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [isPending, startTransition] = useTransition();

  const setValue = (colId: string, val: unknown) =>
    setValues((prev) => ({ ...prev, [colId]: val }));

  // 링크 컬럼 ID 찾기
  const linkColId = columns.find((c) => c.columnType === "link")?.id;

  // 링크 자동 추출
  const handleLinkBlur = async (url: string) => {
    if (!url || !url.startsWith("http")) return;
    setIsFetching(true);
    setFetchError("");
    try {
      const meta = await fetchLinkMeta(url);
      const trackNameCol = columns.find((c) => c.name === "트랙명");
      const artistCol = columns.find((c) => c.name === "아티스트");
      if (meta.title && trackNameCol && !values[trackNameCol.id]) {
        setValue(trackNameCol.id, meta.title);
      }
      if (meta.artist && artistCol && !values[artistCol.id]) {
        setValue(artistCol.id, meta.artist);
      }
    } catch {
      setFetchError("링크 정보를 가져오지 못했습니다.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const finalValues = { ...values };
      if (linkColId && linkUrl) finalValues[linkColId] = linkUrl;
      await createDiggingTrack({ linkUrl: linkUrl || undefined, values: finalValues });
      setValues({});
      setLinkUrl("");
      onOpenChange(false);
      onSuccess();
    });
  };

  const handleClose = () => {
    setValues({});
    setLinkUrl("");
    setFetchError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>트랙 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 링크 (최상단 — 자동 추출 트리거) */}
          {linkColId && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">링크</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onBlur={(e) => handleLinkBlur(e.target.value)}
                  disabled={isPending}
                />
                {isFetching && (
                  <span className="text-xs text-muted-foreground self-center whitespace-nowrap">
                    추출 중...
                  </span>
                )}
              </div>
              {fetchError && (
                <p className="text-xs text-muted-foreground">{fetchError}</p>
              )}
            </div>
          )}

          {/* 나머지 컬럼 (링크 제외) */}
          {columns
            .filter((col) => col.columnType !== "link")
            .map((col) => {
              const val = values[col.id];
              const options: string[] = col.options ? JSON.parse(col.options) : [];

              return (
                <div key={col.id} className="space-y-1.5">
                  <label className="text-sm font-medium">{col.name}</label>

                  {col.columnType === "text" && (
                    <Input
                      value={(val as string) ?? ""}
                      onChange={(e) => setValue(col.id, e.target.value)}
                      disabled={isPending}
                    />
                  )}

                  {col.columnType === "textarea" && (
                    <textarea
                      value={(val as string) ?? ""}
                      onChange={(e) => setValue(col.id, e.target.value)}
                      rows={3}
                      disabled={isPending}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  )}

                  {col.columnType === "number" && (
                    <Input
                      type="number"
                      value={(val as string) ?? ""}
                      onChange={(e) => setValue(col.id, e.target.value)}
                      disabled={isPending}
                    />
                  )}

                  {col.columnType === "select" && (
                    <select
                      value={(val as string) ?? ""}
                      onChange={(e) => setValue(col.id, e.target.value)}
                      disabled={isPending}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">선택</option>
                      {options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )}

                  {col.columnType === "rating" && (
                    <StarRating
                      value={(val as number) ?? 0}
                      onChange={(v) => setValue(col.id, v)}
                    />
                  )}

                  {col.columnType === "camelot_key" && (
                    <CamelotPicker
                      value={(val as string) ?? ""}
                      onChange={(v) => setValue(col.id, v)}
                    />
                  )}
                </div>
              );
            })}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "추가 중..." : "추가"}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              취소
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
