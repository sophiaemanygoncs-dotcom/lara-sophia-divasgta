import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import Analyzer from "./components/analyzer";
import SignOutButton from "./components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  // Verifica a identidade no servidor, inclusive no acesso direto à URL.
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  return (
    <main className="pagina">
      <section className="card">
        <header className="sessao">
          <p>Conectada como <strong>{user.email}</strong></p>
          <SignOutButton />
        </header>
        <h1>Lara & Sophia 💜</h1>
        <Analyzer />
      </section>
    </main>
  );
}
