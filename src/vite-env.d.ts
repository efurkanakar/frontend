export {}

declare global {
  interface ImportMetaEnv {
    readonly [key: string]: string | undefined
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
