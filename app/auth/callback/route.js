import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    try {
      const supabase = await createClient();
      if (supabase) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return NextResponse.redirect(new URL("/", url.origin));
      }
    } catch {
      // Mostra uma mensagem em português na página de login.
    }
  }
  return NextResponse.redirect(new URL("/login?error=confirmation", url.origin));
}
