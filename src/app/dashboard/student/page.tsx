import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function StudentDashboard() {
  const session = await auth();
  const role = session?.user?.role;

  // 접근 통제
  if (role !== "student") {
    redirect("/dashboard/admin");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          Personal Portal
          <span className="text-muted-foreground font-normal">/ Student</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your progress and upcoming lessons.
        </p>
      </header>

      {/* Curriculum Progress */}
      <section className="p-8 rounded-xl border border-border bg-card shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Current Module
          </h2>
        </div>

        <div className="flex items-center justify-between p-6 rounded-lg border bg-muted/20">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              WEEK 01
            </p>
            <h3 className="font-medium text-foreground text-lg">
              Introduction to Hypnotic Groove
            </h3>
          </div>
          <Button variant="default" className="gap-2">
            <PlayCircle className="w-4 h-4" /> Resume Learning
          </Button>
        </div>
      </section>

      {/* Sub Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Next Lesson */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Next Lesson
          </h3>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-md bg-muted flex flex-col items-center justify-center border border-border">
              <span className="text-[10px] font-bold text-muted-foreground">
                OCT
              </span>
              <span className="text-2xl font-bold">24</span>
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">
                1:1 Feedback Session
              </p>
              <p className="text-sm text-muted-foreground">
                20:00 KST / Online Studio
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Feedbacks */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Feedback
          </h3>
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/10 text-muted-foreground">
            <p className="text-sm italic">No active feedback requests.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
