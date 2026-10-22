export const itensPorPagina = 20;

export async function salvarAnalise(supabase, campos, resposta, desafio) {
  const entrada = desafio.campos
    .map(campo => `${campo.rotulo}:\n${campos[campo.id]}`)
    .join("\n\n");
  // user_id é preenchido pelo default auth.uid() da tabela, usando a sessão.
  // Nunca aceite esse valor no corpo enviado pelo navegador.
  const { error } = await supabase.from("respostas").insert({ entrada, resposta });
  if (error) throw new Error("Não foi possível salvar a análise.");
}

export async function carregarHistorico(supabase, userId, pagina) {
  const inicio = (pagina - 1) * itensPorPagina;
  const { data, count, error } = await supabase.from("respostas")
    .select("id, user_id, entrada, resposta, criado_em", { count: "exact" })
    .eq("user_id", userId)
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .range(inicio, inicio + itensPorPagina - 1);
  if (error || !Array.isArray(data) || data.some(item => item.user_id !== userId)) {
    throw new Error("Não foi possível carregar seu histórico.");
  }
  return { itens: data, temProxima: count > inicio + itensPorPagina };
}
