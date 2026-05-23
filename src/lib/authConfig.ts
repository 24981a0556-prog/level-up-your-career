/** OAuth return path — must be allowlisted in Supabase Auth → URL Configuration. */
export const AUTH_CALLBACK_PATH = "/auth/callback";

export function getAuthRedirectUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${AUTH_CALLBACK_PATH}`;
}

export function isOAuthCallbackUrl(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return (
    params.has("code") ||
    params.has("error") ||
    params.has("error_description") ||
    hashParams.has("access_token")
  );
}

export function cleanAuthParamsFromUrl(fallbackPath = "/auth"): void {
  const path =
    window.location.pathname === AUTH_CALLBACK_PATH
      ? fallbackPath
      : window.location.pathname;
  window.history.replaceState({}, document.title, path);
}
