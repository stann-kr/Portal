import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  LogOut,
  BookOpen,
  FileVideo,
  Users,
} from "lucide-react";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role ?? "student";

  const navItems =
    role === "admin"
      ? [
          {
            name: "Dashboard",
            href: "/dashboard/admin",
            icon: LayoutDashboard,
          },
          { name: "Students", href: "/dashboard/admin", icon: Users },
          { name: "Community", href: "/community", icon: MessageSquare },
        ]
      : [
          {
            name: "Dashboard",
            href: "/dashboard/student",
            icon: LayoutDashboard,
          },
          {
            name: "Curriculum",
            href: "/dashboard/student/curriculum",
            icon: BookOpen,
          },
          {
            name: "Assignments",
            href: "/dashboard/student/assignments",
            icon: FileVideo,
          },
          { name: "Community", href: "/community", icon: MessageSquare },
        ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-muted/30 flex flex-col">
        {/* Brand */}
        <div className="h-14 px-5 border-b border-border flex items-center">
          <span className="text-sm font-semibold text-foreground tracking-tight">
            Stann Lumo Portal
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="px-3 py-4 border-t border-border space-y-3">
          <div className="px-3 py-2 rounded-md bg-background border border-border">
            <p className="text-xs text-muted-foreground truncate">
              {session.user.email}
            </p>
            <p className="text-xs font-medium capitalize text-foreground mt-0.5">
              {role}
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button
              variant="ghost"
              type="submit"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
