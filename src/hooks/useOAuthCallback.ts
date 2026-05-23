import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cleanAuthParamsFromUrl, isOAuthCallbackUrl } from "@/lib/authConfig";

/**
 * Completes Supabase PKCE OAuth when Google redirects back with ?code=...
 * Must run on any route that can receive the OAuth redirect (/, /auth, /auth/callback).
 */
export function useOAuthCallback() {
  const [processing, setProcessing] = useState(() => isOAuthCallbackUrl());

  useEffect(() => {
    if (!isOAuthCallbackUrl()) {
      setProcessing(false);
      return;
    }

    let cancelled = false;

    const completeOAuth = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const oauthError =
        searchParams.get("error_description") ?? searchParams.get("error");
      if (oauthError) {
        console.error("OAuth error:", oauthError);
        cleanAuthParamsFromUrl();
        if (!cancelled) setProcessing(false);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { data: existing } = await supabase.auth.getSession();
        if (!existing.session) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("OAuth session exchange failed:", error.message);
          }
        }
        cleanAuthParamsFromUrl();
      } else if (hashParams.has("access_token")) {
        // Implicit/hash flow — Supabase client picks this up via detectSessionInUrl
        cleanAuthParamsFromUrl();
      }

      if (!cancelled) setProcessing(false);
    };

    void completeOAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  return { processingOAuth: processing };
}
