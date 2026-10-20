import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { configurationError } from "../../lib/supabase/errors";
import LoginForm from "./login-form";

export const metadata = { title: "Entrar | Lara & Sophia" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/");
  }
  const params = await searchParams;
  return (
    <main className="pagina">
      <section className="card">
        <h1>Lara & Sophia 💜</h1>
        <p className="subtitulo">Entre ou crie sua conta para continuar.</p>
        <LoginForm configurationError={!supabase ? configurationError : null}
          confirmationError={params.error === "confirmation" ? "Não foi possível confirmar seu e-mail. O link pode ter expirado. Tente entrar ou solicite um novo cadastro." : null} />
      </section>
    </main>
  );
}
