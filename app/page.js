import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import Analyzer from "./components/analyzer";
import SessionHeader from "./components/session-header";
import { desafio } from "../desafio";

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
        <SessionHeader email={user.email} />
        <h1>{desafio.nome}</h1>
        <p className="subtitulo">{desafio.subtitulo}</p>
        <Analyzer desafio={desafio} />
      </section>
    </main>
  );
}
