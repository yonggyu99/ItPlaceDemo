/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_KAKAO_API_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  