"use client";

import { useTransition } from "react";
import { deleteCategory } from "@/lib/actions/categories";
import { Trash2 } from "lucide-react";

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("정말 이 카테고리를 삭제하시겠습니까?")) {
      startTransition(async () => {
        await deleteCategory(categoryId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
      title="삭제"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
