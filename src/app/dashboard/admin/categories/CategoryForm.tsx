"use client";

import { useActionState } from "react";
import { createCategory, type CategoryState } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";

const initialState: CategoryState = {};

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">카테고리 이름</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="예: Gear & Setup"
          className="w-full px-3 py-2 border border-border rounded-md bg-transparent text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium">Slug (URL 식별자)</label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          placeholder="예: gear-and-setup"
          className="w-full px-3 py-2 border border-border rounded-md bg-transparent text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">설명 (선택)</label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="장비 및 셋업에 관한 이야기"
          className="w-full px-3 py-2 border border-border rounded-md bg-transparent text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="sortOrder" className="text-sm font-medium">정렬 순서(숫자)</label>
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue="0"
          className="w-full px-3 py-2 border border-border rounded-md bg-transparent text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.success && <p className="text-sm text-green-500">생성되었습니다.</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "생성 중..." : "카테고리 추가"}
      </Button>
    </form>
  );
}
