"use client";

import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, BookmarkPlus, MessageSquare } from "lucide-react";

interface Feedback {
  id: string;
  time_marker: number;
  content: string;
}

export function VideoPlayer({
  url,
  role,
}: {
  url: string;
  role: "admin" | "student";
}) {
  const [playing, setPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [comment, setComment] = useState("");

  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    // Hydration 불일치 방지용 (React 19에서는 렌더링 도중 상태변경 지양)
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  const handleProgress = (state: { playedSeconds: number }) => {
    setPlayedSeconds(state.playedSeconds);
  };

  const handleAddFeedback = () => {
    if (!comment.trim()) return;
    const newFeedback: Feedback = {
      id: Math.random().toString(36).substr(2, 9),
      time_marker: Math.floor(playedSeconds),
      content: comment,
    };
    // D1 DB 연동 로직 차후 연동 (Server Action 호출)
    setFeedbacks((prev) =>
      [...prev, newFeedback].sort((a, b) => a.time_marker - b.time_marker),
    );
    setComment("");
  };

  const handleSeek = (time: number) => {
    playerRef.current?.seekTo(time, "seconds");
    setPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!isClient) return null; // Hydration mismatch 방지

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-primary/20 shadow-[0_0_30px_rgba(0,255,255,0.05)] flex items-center justify-center group">
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          onProgress={handleProgress}
          width="100%"
          height="100%"
          controls={false}
          className="absolute top-0 left-0"
        />

        {/* Custom Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/20 rounded-full w-10 h-10 p-0"
              onClick={() => setPlaying(!playing)}
            >
              {playing ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-1" />
              )}
            </Button>
            <div className="text-secondary font-mono text-sm">
              {formatTime(playedSeconds)}
            </div>
          </div>
        </div>
      </div>

      {role === "admin" && (
        <div className="flex gap-2 items-center p-4 bg-accent/30 rounded-xl border border-border">
          <BookmarkPlus className="w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Add feedback at current timestamp..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddFeedback} variant="secondary">
            Drop Pin
          </Button>
        </div>
      )}

      {/* Feedbacks Timeline */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Timeline Feedbacks
        </h3>
        {feedbacks.length === 0 ? (
          <div className="p-4 border border-dashed border-border rounded-lg text-sm text-center text-muted-foreground">
            No feedback pins dropped yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => handleSeek(fb.time_marker)}
              >
                <div className="px-2 py-1 rounded bg-secondary/10 text-secondary font-mono text-xs font-bold group-hover:bg-secondary group-hover:text-black transition-colors">
                  {formatTime(fb.time_marker)}
                </div>
                <p className="text-sm text-white flex-1 leading-relaxed">
                  {fb.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
