import { createEvents, EventAttributes } from "ics";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ student_id: string }> },
) {
  // 실제 DB(D1)에서는 student_id에 해당하는 lessons을 조회
  const { student_id } = await params;

  // 목업 데이터
  const mockLessons: EventAttributes[] = [
    {
      title: "Terminal Masterclass: 1:1 DJ Feedback",
      description: "Reviewing recent mixset and track selection strategies.",
      start: [2026, 3, 15, 20, 0], // 년, 월, 일, 시, 분
      duration: { hours: 1, minutes: 30 },
      location: "Terminal Studio (Remote Drop-in)",
      url: "https://portal.stann.com",
      status: "CONFIRMED",
      busyStatus: "BUSY",
      organizer: { name: "Stann Lumo", email: "admin@stann.com" },
      attendees: [
        { name: "Student Agent", email: "student@example.com", rsvp: true },
      ],
    },
  ];

  return new Promise((resolve) => {
    createEvents(mockLessons, (error, value) => {
      if (error) {
        resolve(
          new Response(JSON.stringify({ error: error.message }), {
            status: 500,
          }),
        );
        return;
      }

      resolve(
        new Response(value, {
          headers: {
            // macOS 캘린더나 모바일 캘린더 앱에서 ics 파일을 인식하도록 헤더 설정
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": `attachment; filename="stann-lumo-${student_id}.ics"`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }),
      );
    });
  });
}
