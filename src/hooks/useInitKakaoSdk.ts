import { useEffect } from "react";

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        uploadImage: (opts: {
          file: File[];
        }) => Promise<{ infos: { original: { url: string } } }>;
        sendDefault: (template: Record<string, unknown>) => void;
      };
    };
  }
}

export function useInitKakaoSdk(): void {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.7/kakao.min.js";
    script.integrity =
      "sha384-tJkjbtDbvoxO+diRuDtwRO9JXR7pjWnfjfRn5ePUpl7e7RJCxKCwwnfqUAdXh53p";
    script.crossOrigin = "anonymous";

    document.head.appendChild(script);

    const onLoad = (): void => {
      const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "";
      if (key && window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(key);
      }
    };

    script.addEventListener("load", onLoad);

    return () => {
      script.removeEventListener("load", onLoad);
      document.head.removeChild(script);
    };
  }, []);
}
