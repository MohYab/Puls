import { useEffect } from "react";

const APP_NAME = "Puls";

// Sets the browser tab title, e.g. "Calendar – Puls", so screen reader users
// hear that the page has changed and tabs and history can be told apart.
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} – ${APP_NAME}`;
  }, [title]);
}
