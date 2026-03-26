/**
 * @file src/components/player/VideoPlayer.tsx
 * @description 미디어 플레이어 (YouTube/SoundCloud 지원).
 * - onSeekRequest prop으로 외부(TimelineFeedback)에서 시점 이동 제어
 * - role에 따른 UI 분기 (admin: 피드백 폼, student: 재생만)
 */
"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type ReactPlayerType from "react-player";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

/** seekTo 메서드를 가진 ReactPlayer 인스턴스 타입 */
type ReactPlayerInstance = {
  seekTo: (amount: number, type: "seconds" | "fraction") => void;
};

// SSR에서 react-player를 제외해 next/document 관련 충돌 방지
const ReactPlayer = dynamic(
  () => import("react-player"),
  { ssr: false },
) as unknown as typeof ReactPlayerType;

interface VideoPlayerProps {
  url: string;
  /** 외부에서 특정 시점 이동을 요청할 때 (초 단위) */
  seekToSeconds?: number;
}

export function VideoPlayer({ url, seekToSeconds }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);

  const playerRef = useRef<ReactPlayerInstance | null>(null);

  // ─── 외부 seekTo 요청 처리 ──────────────────────
  useEffect(() => {
    if (seekToSeconds !== undefined && playerRef.current) {
      playerRef.current.seekTo(seekToSeconds, "seconds");
      setPlaying(true);
    }
  }, [seekToSeconds]);

  const handleProgress = (state: { playedSeconds: number }) => {
    setPlayedSeconds(state.playedSeconds);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      {/* 플레이어 영역 */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-border group shadow-sm">
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          onProgress={handleProgress}
          width="100%"
          height="100%"
          controls={true}
          className="absolute top-0 left-0"
        />

        {/* 커스텀 오버레이 (controls=false 일 때만 사용) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full w-9 h-9 p-0"
              onClick={() => setPlaying(!playing)}
              aria-label={playing ? "일시정지" : "재생"}
            >
              {playing ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </Button>
            <span className="text-white font-mono text-xs">
              {formatTime(playedSeconds)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
