/**
 * @file src/components/dashboard/ProgressCharts.tsx
 * @description 학생 대시보드용 원형 진행률 차트 및 통계 카드 컴포넌트.
 * Framer Motion을 사용하여 수치 변화 시 애니메이션 효과를 부여함.
 */
"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle2, Circle } from "lucide-react";

interface ProgressChartsProps {
  completedCount: number;
  totalCount: number;
  displayName: string;
}

export function ProgressCharts({
  completedCount,
  totalCount,
  displayName,
}: ProgressChartsProps) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // SVG 원형 차트 계산
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 원형 진행률 차트 */}
      <div className="lg:col-span-1 p-8 rounded-2xl border border-border bg-card shadow-sm flex flex-col items-center justify-center space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Overall Progress</h3>
        
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Background Circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted/20"
            />
            {/* Progress Circle with Animation */}
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              className="text-primary"
            />
          </svg>
          {/* Centered Percentage Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-bold"
            >
              {percentage}%
            </motion.span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-medium">
          {completedCount} / {totalCount} Modules Completed
        </p>
      </div>

      {/* 요약 카드들 */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 인사말 및 상태 */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-sm text-muted-foreground">Welcome back,</h4>
            <p className="text-2xl font-bold">{displayName || "Student"}</p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Award className="w-3 h-3" />
              Lumo Scholar
            </div>
            {percentage >= 90 && (
              <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                Elite Producer
              </div>
            )}
          </div>
        </div>

        {/* 상세 통계 */}
        <div className="grid grid-rows-2 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center gap-4">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">완료된 주차</p>
              <p className="text-lg font-bold">{completedCount} Weeks</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Circle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">남은 주차</p>
              <p className="text-lg font-bold">{Math.max(0, totalCount - completedCount)} Weeks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
