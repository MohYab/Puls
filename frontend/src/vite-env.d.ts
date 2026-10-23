/// <reference types="vite/client" />

// Environment variables used by the app. Only variables starting with VITE_
// are exposed to the browser, so nothing secret may be added here.
interface ImportMetaEnv {
  /** Base URL of the API, e.g. http://localhost:3001/api. Optional. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
