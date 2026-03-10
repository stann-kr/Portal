"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import YoutubeExtension from "@tiptap/extension-youtube";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Send,
} from "lucide-react";

export default function TiptapEditor({
  onSubmit,
}: {
  onSubmit: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      YoutubeExtension.configure({
        controls: true,
        nocookie: true,
      }),
    ],
    content: "<p>Start discussing gear, tracks, or schedules...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 text-sm text-foreground",
      },
    },
  });

  const addImage = () => {
    // 차후 Cloudflare R2 업로드 API를 활용하여 URL 반환 후 적용되도록 수정 필요
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt("Enter YouTube URL:");
    if (url && editor) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  const handleSubmit = () => {
    if (!editor) return;
    const dirtyHtml = editor.getHTML();
    // DOMPurify를 사용해 저장/출력 전 XSS 방지
    const cleanHtml = DOMPurify.sanitize(dirtyHtml);
    onSubmit(cleanHtml);
    editor.commands.clearContent();
  };

  if (!editor) return null;

  return (
    <div className="border border-border rounded-xl bg-accent/20 overflow-hidden shadow-inner flex flex-col focus-within:ring-1 focus-within:ring-primary transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-black/40">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={
            editor.isActive("bold")
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground"
          }
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={
            editor.isActive("italic")
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground"
          }
        >
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          className="text-muted-foreground hover:text-secondary"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addYoutube}
          className="text-muted-foreground hover:text-red-400"
        >
          <Video className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 cursor-text bg-background/50">
        <EditorContent editor={editor} />
      </div>

      {/* Footer / Submit */}
      <div className="p-3 border-t border-border bg-black/40 flex justify-end">
        <Button
          onClick={handleSubmit}
          className="gap-2 bg-primary text-black hover:bg-primary/80"
        >
          <Send className="w-4 h-4" /> TRANSMIT
        </Button>
      </div>
    </div>
  );
}
