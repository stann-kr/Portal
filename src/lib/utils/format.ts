/**
 * @file src/lib/utils/format.ts
 * @description 시간, 날짜 등 포맷팅 관련 공통 유틸리티 함수.
 */

/**
 * 초 단위를 "MM:SS" 형식의 문자열로 변환합니다.
 * @param seconds - 변환할 초 단위 시간
 * @returns "MM:SS" 형식의 문자열
 */
export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
