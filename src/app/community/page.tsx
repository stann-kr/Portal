import { auth } from "@/auth";
import TiptapEditor from "@/components/community/TiptapEditor";
import { MessageSquareShare, Terminal } from "lucide-react";

export default async function CommunityPage() {
  const session = await auth();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar (Community Channels) */}
      <aside className="w-64 border-r border-border bg-accent/20 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border text-primary font-black tracking-tighter flex items-center gap-2">
          <Terminal className="w-5 h-5" /> TERMINAL_COMMS
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs font-bold text-muted-foreground uppercase mb-2">
            Channels
          </div>
          {[
            "# gear-and-setup",
            "# track-id",
            "# terminal-info",
            "# general",
          ].map((ch) => (
            <button
              key={ch}
              className="w-full text-left px-3 py-2 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
            >
              {ch}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Chat / Board Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border bg-black/60 backdrop-blur-md flex items-center px-6 sticky top-0 z-10">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <span className="text-primary"># gear-and-setup</span>
            <span className="text-muted-foreground font-normal text-xs ml-2">
              Discuss studio routing and analog hardwares.
            </span>
          </h2>
        </header>

        {/* Messages / Posts Placeholder */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col-reverse">
          {/* Editor Placeholder Area (Always at bottom for new posts) */}
          <div className="mt-8 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(0,255,255,0.05)] bg-black/40 p-1 relative z-20">
            <TiptapEditor
              onSubmit={(html) => console.log("SUBMIT HTML:", html)}
            />
            <p className="text-[10px] text-muted-foreground absolute -bottom-5 right-2 uppercase">
              TRANSMITTING AS {session?.user?.email || "UNKNOWN"}
            </p>
          </div>

          {/* Dummy Post */}
          <div className="flex gap-4 p-4 rounded-xl border border-border bg-accent/10 hover:bg-accent/20 transition-colors">
            <div className="w-10 h-10 rounded bg-primary/20 border border-primary/50 text-xs font-bold flex items-center justify-center text-primary">
              ADM
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">Stann Lumo</span>
                <span className="text-xs text-muted-foreground">
                  Today at 14:00 KST
                </span>
              </div>
              <div className="text-sm text-foreground prose prose-invert">
                <p>
                  Welcome to the private masterclass network. Secure your
                  connections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
