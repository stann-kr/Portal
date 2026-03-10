import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function RootPage() {
  const session = await auth();

  if (session?.user) {
    const role = session.user.role;
    redirect(`/dashboard/${role === "admin" ? "admin" : "student"}`);
  }

  redirect("/login");
}
