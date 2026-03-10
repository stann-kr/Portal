import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminDashboard() {
  const session = await auth();
  const role = session?.user?.role;

  // 어드민 권한 재검증
  if (role !== "admin") {
    redirect("/dashboard/student");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          Dashboard
          <span className="text-muted-foreground font-normal">/ Admin</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your students and lesson schedules.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-lg border border-border bg-card shadow-sm transition-all hover:bg-accent/5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Active Students
          </h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card shadow-sm transition-all hover:bg-accent/5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Pending Feedbacks
          </h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card shadow-sm transition-all hover:bg-accent/5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Upcoming Lessons
          </h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold">Student Roster</h2>
        </div>
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/30 text-muted-foreground">
          <p className="text-sm">No students registered yet.</p>
        </div>
      </section>
    </div>
  );
}
