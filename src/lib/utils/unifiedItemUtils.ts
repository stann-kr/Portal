/**
 * @file src/lib/utils/unifiedItemUtils.ts
 * @description UnifiedItem 타입 정의 및 클라이언트/서버 공용 유틸.
 * "use server" 없음 — Client Component에서 임포트 가능.
 */

// ─── 타입 정의 ────────────────────────────────────

export type UnifiedItemType = "EVENT" | "NOTE" | "DIGGING" | "QNA" | "ASSIGNMENT";

export type UnifiedItem = {
  id: string;
  type: UnifiedItemType;
  /** EVENT 의 CalendarEventType, QNA 의 QnaStatus */
  subType?: string;
  title: string;
  description?: string;
  /** 정렬·그룹핑 기준 날짜 */
  date: Date;
  endDate?: Date | null;
  metadata: Record<string, unknown>;
};

// ─── 색상 맵 ──────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  EVENT_LESSON:   "#3B82F6",
  EVENT_PRACTICE: "#22C55E",
  EVENT_GIG:      "#EF4444",
  EVENT_NOTE:     "#F59E0B",
  NOTE:           "#8B5CF6",
  DIGGING:        "#EC4899",
  QNA:            "#F97316",
  ASSIGNMENT:     "#06B6D4",
};

/**
 * UnifiedItem 의 타입·서브타입에 따른 표시 색상 반환.
 */
export function getUnifiedItemColor(item: UnifiedItem): string {
  if (item.type === "EVENT" && item.subType) {
    return TYPE_COLORS[`EVENT_${item.subType}`] ?? TYPE_COLORS["EVENT_NOTE"];
  }
  return TYPE_COLORS[item.type] ?? "#71717a";
}
