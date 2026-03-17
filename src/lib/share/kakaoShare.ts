/** 카카오톡 피드 공유 (SDK는 useInitKakaoSdk에서 미리 로드) */

export async function shareViaKakao(params: {
  blob: Blob;
  title: string;
  description: string;
}): Promise<void> {
  if (!window.Kakao?.isInitialized()) {
    throw new Error("Kakao SDK not initialized");
  }

  // 생성 이미지를 카카오 CDN에 업로드
  const file = new File([params.blob], "alopedia-result.png", {
    type: "image/png",
  });
  const uploaded = await window.Kakao.Share.uploadImage({ file: [file] });
  const imageUrl = uploaded.infos.original.url;

  const siteUrl = "https://alopedia.kr";

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: params.title,
      description: params.description,
      imageUrl,
      link: { mobileWebUrl: siteUrl, webUrl: siteUrl },
    },
    buttons: [
      {
        title: "나도 분석하기",
        link: { mobileWebUrl: siteUrl, webUrl: siteUrl },
      },
    ],
  });
}
