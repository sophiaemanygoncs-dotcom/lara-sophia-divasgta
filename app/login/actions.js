"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { authErrorMessage, configurationError } from "../../lib/supabase/errors";

export async function authenticate(previousState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const intent = formData.get("intent");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Digite um e-mail válido." };
  if (!password) return { error: "Digite sua senha." };
  if (intent !== "login" && intent !== "signup") return { error: "Escolha Entrar ou Criar conta." };
  if (intent === "signup" && password.length < 6) return { error: "A senha deve ter pelo menos 6 caracteres." };

  try {
    const supabase = await createClient();
    if (!supabase) return { error: configurationError };
    if (intent === "signup") {
      const origin = (await headers()).get("origin");
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: origin ? { emailRedirectTo: new URL("/auth/callback", origin).toString() } : undefined
      });
      if (error) return { error: authErrorMessage(error) };
      if (!data.session) return { message: "Confira seu e-mail para confirmar o cadastro. Depois, volte aqui para entrar." };
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: authErrorMessage(error) };
    }
  } catch {
    return { error: "Não foi possível acessar o serviço de login. Verifique sua conexão e tente novamente." };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: configurationError };
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: authErrorMessage(error) };
  } catch {
    return { error: "Não foi possível sair. Tente novamente." };
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
