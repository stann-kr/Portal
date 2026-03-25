/**
 * @file src/components/dashboard/DiggingAnalyticsWidget.tsx
 * @description 학생 대시보드 — 디깅 트랙 수집 통계 위젯 (Client Component).
 * Phase 5 (Digging 게시판) 완료 전까지 목데이터로 차트 미리 표시.
 * Recharts BarChart 기반 주간 수집 현황.
 */
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Music2, TrendingUp } from "lucide-react";

// Phase 5 완료 후 실제 API로 교체 예정
const MOCK_WEEKLY_DATA = [
  { day: "Mon", tracks: 2 },
  { day: "Tue", tracks: 5 },
  { day: "Wed", tracks: 3 },
  { day: "Thu", tracks: 8 },
  { day: "Fri", tracks: 4 },
  { day: "Sat", tracks: 12 },
  { day: "Sun", tracks: 7 },
];

const TOTAL_MOCK = MOCK_WEEKLY_DATA.reduce((s, d) => s + d.tracks, 0);
const MAX_DAY = MOCK_WEEKLY_DATA.reduce((a, b) =>
  a.tracks > b.tracks ? a : b,
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{payload[0].value} tracks</p>
    </div>
  );
}

export function DiggingAnalyticsWidget() {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Digging Analytics
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground/60 italic">
          Phase 5 preview
        </span>
      </div>

      {/* 요약 수치 */}
      <div className="flex items-end gap-3">
        <div>
          <p className="text-3xl font-bold text-foreground">{TOTAL_MOCK}</p>
          <p className="text-xs text-muted-foreground">이번 주 수집 트랙</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-500 font-medium mb-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Best: {MAX_DAY.day} ({MAX_DAY.tracks})</span>
        </div>
      </div>

      {/* 바 차트 */}
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={MOCK_WEEKLY_DATA}
            margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
            barSize={14}
          >
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Bar dataKey="tracks" radius={[4, 4, 0, 0]}>
              {MOCK_WEEKLY_DATA.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.day === MAX_DAY.day
                      ? "hsl(var(--primary))"
                      : "hsl(var(--primary) / 0.3)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
