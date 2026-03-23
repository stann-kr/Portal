"use server";

import { auth } from "@/auth";

export async function uploadToR2(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  // Cloudflare R2 Binding Access (Cloudflare Pages/Workers Adapter 환경 가정)
  // 로컬 개발 시에는 MinIO와 같은 S3 호환 스토리지를 쓰거나 wrangler 프록시 사용.
  const env = process.env as any;
  const bucket = env.BUCKET as any;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const key = `uploads/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    if (bucket) {
      // 실제 R2 버킷에 저장
      await bucket.put(key, arrayBuffer, {
        httpMetadata: { contentType: file.type },
      });
      return { success: true, url: `${env.NEXT_PUBLIC_R2_DEV_URL}/${key}` };
    } else {
      // 버킷 바인딩이 없을 경우 (로컬 임시 모의 로직)
      console.warn("R2 Bucket binding not found. Mocking successful upload.");
      return { success: true, url: `https://mock.storage/${key}` };
    }
  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    return { success: false, error: error.message };
  }
}
