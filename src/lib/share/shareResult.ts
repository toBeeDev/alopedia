/** 이미지 저장 — 모바일: Share API (사진에 저장), 데스크톱: <a download> */

export async function downloadResultImage(blob: Blob): Promise<void> {
  const file = new File([blob], "alopedia-result.png", { type: "image/png" });

  // 모바일 — Share API로 "사진에 저장" 옵션 제공
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch {
      // 취소 또는 실패 — 폴백
    }
  }

  // 데스크톱 폴백
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "alopedia-result.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
