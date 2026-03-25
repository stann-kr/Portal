"use server";

import { auth } from "@/auth";
import { generatePresignedUploadUrl, type PresignedUrlOptions } from "@/lib/r2";

export interface RequestPresignedUrlInput {
  fileName: string;
  mimeType: string;
  fileSize: number;
  options?: PresignedUrlOptions;
}

export interface RequestPresignedUrlResult {
  success: boolean;
  uploadUrl?: string;
  key?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * 클라이언트에서 파일 메타데이터를 받아 R2 Presigned Upload URL을 발급
 * 실제 파일 전송은 클라이언트가 반환된 uploadUrl로 직접 R2에 PUT 요청
 *
 * @param input 파일 메타데이터 (이름, MIME, 크기) + 옵션
 */
export async function requestPresignedUploadUrl(
  input: RequestPresignedUrlInput
): Promise<RequestPresignedUrlResult> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    const result = await generatePresignedUploadUrl(
      input.fileName,
      input.mimeType,
      input.fileSize,
      input.options
    );

    return {
      success: true,
      uploadUrl: result.uploadUrl,
      key: result.key,
      publicUrl: result.publicUrl,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "업로드 URL 생성 실패";
    console.error("[upload] Presigned URL 생성 오류:", error);
    return { success: false, error: message };
  }
}
