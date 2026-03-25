/**
 * @file src/components/dashboard/ProgressCharts.tsx
 * @description 학생 대시보드 — 원형 진행률 차트 (Client Component).
 * SVG 애니메이션 원형 차트 + Recharts 스파크라인으로 최근 학습 추이 시각화.
 */
"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle2, Circle } from "lucide-react";

interface ProgressChartsProps {
  completedCount: number;
  totalCount: number;
  displayName: string;
}

// 최근 학습 추이 (목데이터 — 실제 완료 일자 기록 기능 추가 후 교체 예정)
function buildSparklineData(completed: number) {
  const weeks = 8;
  return Array.from({ length: weeks }, (_, i) => ({
    week: `W${i + 1}`,
    done: Math.min(completed, Math.round((completed / weeks) * (i + 1))),
  }));
}

interface SparkTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function SparkTooltip({ active, payload, label }: SparkTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-border bg-card px-2 py-1 text-xs shadow">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold">{payload[0].value} 완료</p>
    </div>
  );
}

export function ProgressCharts({
  completedCount,
  totalCount,
  displayName: _displayName,
}: ProgressChartsProps) {
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sparkData = buildSparklineData(completedCount);

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Overall Progress
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* 원형 차트 */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-muted/30"
            />
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              stroke="hsl(var(--primary))"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold text-foreground leading-none"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {percentage}%
            </motion.span>
            <span className="text-[10px] text-muted-foreground mt-1">
              Complete
            </span>
          </div>
        </div>

        {/* 우측 통계 + 스파크라인 */}
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground">
                  {completedCount}
                </p>
                <p className="text-[11px] text-muted-foreground">완료</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2">
              <Circle className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground">
                  {Math.max(0, totalCount - completedCount)}
                </p>
                <p className="text-[11px] text-muted-foreground">남은 주차</p>
              </div>
            </div>
          </div>

          {/* 스파크라인 — 최근 8주 학습 추이 */}
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">학습 추이 (8주)</p>
            <div className="h-14">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={sparkData}
                  margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                >
                  <defs>
                    <linearGradient
                      id="sparkGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<SparkTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="done"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#sparkGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
