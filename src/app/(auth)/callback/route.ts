import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=auth_failed`
        );
      }

      // Successfully authenticated, redirect to the next URL or dashboard
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    } catch (error) {
      console.error("Unexpected error during auth callback:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=auth_failed`
      );
    }
  }

  // No code present, redirect to login with error
  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
}
