import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * R2 S3 호환 클라이언트 초기화
 * 환경변수: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
 */
function createR2Client(): S3Client {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 환경변수 미설정: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY 확인 필요"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "portal-storage";

/** 허용된 파일 MIME 타입 */
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  audio: ["audio/mpeg", "audio/wav", "audio/flac", "audio/aiff", "audio/ogg", "audio/mp4"],
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/webm"],
};

const ALL_ALLOWED = Object.values(ALLOWED_MIME_TYPES).flat();

/** 최대 파일 크기: 2GB */
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024;

export interface PresignedUrlOptions {
  /** R2 내 저장 경로 prefix (예: "audio/", "images/") */
  prefix?: string;
  /** Presigned URL 유효 시간 (초, 기본 1시간) */
  expiresIn?: number;
  /** 허용할 MIME 타입 목록 (미지정 시 전체 허용 목록 적용) */
  allowedTypes?: string[];
}

export interface PresignedUploadResult {
  /** 클라이언트가 PUT 요청을 보낼 서명된 URL */
  uploadUrl: string;
  /** 업로드 완료 후 DB에 저장할 R2 오브젝트 키 */
  key: string;
  /** 업로드 완료 후 접근할 퍼블릭 URL */
  publicUrl: string;
}

/**
 * R2 직접 업로드용 Presigned URL 생성
 * @param fileName  원본 파일명
 * @param mimeType  파일 MIME 타입
 * @param fileSize  파일 크기 (bytes)
 * @param options   추가 옵션
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  mimeType: string,
  fileSize: number,
  options: PresignedUrlOptions = {}
): Promise<PresignedUploadResult> {
  const { prefix = "uploads/", expiresIn = 3600, allowedTypes = ALL_ALLOWED } = options;

  if (!allowedTypes.includes(mimeType)) {
    throw new Error(`허용되지 않는 파일 형식: ${mimeType}`);
  }

  if (fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error("파일 크기 초과: 최대 2GB");
  }

  const client = createR2Client();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${prefix}${Date.now()}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const publicUrl = `${process.env.R2_PUBLIC_URL ?? ""}/${key}`;

  return { uploadUrl, key, publicUrl };
}

/**
 * R2 오브젝트 삭제
 * @param key  삭제할 R2 오브젝트 키
 */
export async function deleteR2Object(key: string): Promise<void> {
  const client = createR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
}
