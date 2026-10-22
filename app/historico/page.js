import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { carregarHistorico } from "../../lib/historico";
import SessionHeader from "../components/session-header";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meu histórico | Isso é golpe?" };

function formatarData(valor) {
  const data = new Date(valor);
  return valor && !Number.isNaN(data.getTime())
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(data)
    : "Data indisponível";
}

export default async function HistoricoPage({ searchParams }) {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const params = await searchParams;
  const numero = Number(params.pagina || 1);
  const pagina = Number.isSafeInteger(numero) && numero > 0 && numero <= 100000 ? numero : 1;
  let historico;
  try {
    historico = await carregarHistorico(supabase, user.id, pagina);
  } catch {
    // Uma falha de consulta não pode aparecer como se o histórico estivesse vazio.
  }

  return (
    <main className="pagina">
      <section className="card">
        <SessionHeader email={user.email} />
        <h1>Meu histórico</h1>
        <p className="subtitulo">Suas análises, da mais recente para a mais antiga.</p>
        {!historico ? (
          <p className="erro" role="alert">Não foi possível carregar seu histórico. Tente atualizar a página em alguns instantes.</p>
        ) : (
          <>
            {historico.itens.length === 0 && <p>Você ainda não tem análises nesta página. <Link href="/">Analisar uma mensagem</Link></p>}
            {historico.itens.map(item => (
              <article className="item-historico" key={item.id}>
                <h2>Análise de {formatarData(item.criado_em)}</h2>
                <h3>Mensagem enviada</h3>
                <p className="texto-historico">{item.entrada}</p>
                <h3>Resposta</h3>
                <p className="texto-historico">{item.resposta}</p>
              </article>
            ))}
            <nav className="acoes" aria-label="Páginas do histórico">
              {pagina > 1 && <Link href={`/historico?pagina=${pagina - 1}`}>Página anterior</Link>}
              {historico.temProxima && <Link href={`/historico?pagina=${pagina + 1}`}>Próxima página</Link>}
            </nav>
          </>
        )}
      </section>
    </main>
  );
}
