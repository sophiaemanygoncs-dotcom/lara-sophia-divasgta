import { createClient } from "../../../lib/supabase/server";
import { analisarMensagem } from "../../../lib/ia";
import { desafio } from "../../../desafio";
import { salvarAnalise } from "../../../lib/historico";

export const runtime = "nodejs";
export const maxDuration = 40;

function responder(texto, status, headers = {}) {
  return new Response(texto, { status, headers: {
    "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...headers
  } });
}

export async function POST(request) {
  // A rota também valida a sessão: proteger apenas a página não protege a API.
  const supabase = await createClient();
  if (!supabase) return responder("O login ainda não foi configurado.", 503);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return responder("Sua sessão expirou. Entre novamente para analisar mensagens.", 401);

  let campos;
  try {
    campos = await request.json();
  } catch {
    return responder("Não foi possível ler a mensagem. Preencha os campos e tente novamente.", 400);
  }
  const resultado = await analisarMensagem(campos, { desafio, apiKey: process.env.OPENROUTER_API_KEY });
  if (resultado.status === 200) {
    try {
      await salvarAnalise(supabase, campos, resultado.texto, desafio);
      return responder(resultado.texto, 200, { "X-Historico-Status": "salvo" });
    } catch {
      // Preserve a resposta já gerada; repetir a chamada gastaria outra análise.
      return responder(resultado.texto, 200, { "X-Historico-Status": "erro" });
    }
  }
  return responder(resultado.texto, resultado.status);
}
