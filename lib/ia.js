export async function analisarMensagem(campos, { desafio, apiKey, fetcher = fetch }) {
  if (!campos || typeof campos !== "object" || Array.isArray(campos)) {
    return { status: 400, texto: "Preencha os campos para analisar a mensagem." };
  }
  for (const campo of desafio.campos) {
    const valor = campos[campo.id];
    if (typeof valor !== "string" || !valor.trim()) {
      return { status: 400, texto: `Preencha o campo: ${campo.rotulo}.` };
    }
    if (valor.length > 12000) {
      return { status: 400, texto: "A mensagem é muito longa. Use até 12.000 caracteres por campo." };
    }
  }

  if (desafio.modoTeste) {
    return { status: 200, texto: `EXEMPLO DE TESTE — esta resposta é fixa e não analisa a mensagem enviada.

VEREDITO: SUSPEITO

POR QUE: em uma mensagem que cobra uma taxa inesperada e exige pagamento urgente, a cobrança não solicitada e a pressão para agir são sinais de alerta.

O QUE FAZER AGORA:
1. Não clique em links nem envie dados ou dinheiro.
2. Confira a informação pelo aplicativo ou site oficial, acessado por você.
3. Peça ajuda a alguém de confiança antes de agir.` };
  }

  if (!apiKey?.trim()) return { status: 503, texto: "A IA ainda não foi configurada. Cadastre OPENROUTER_API_KEY na Vercel e faça um novo deploy." };
  // Uma única substituição evita interpretar marcadores dentro do texto recebido.
  const ids = new Set(desafio.campos.map(campo => campo.id));
  const prompt = desafio.prompt.replace(/\{([A-Za-z0-9_]+)\}/g, (marcador, id) => ids.has(id) ? campos[id] : marcador);

  try {
    const response = await fetcher("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey.trim()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: desafio.modelo, max_tokens: 900, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(30000)
    });
    if (response.status === 429) return { status: 429, texto: "Você atingiu o limite de uso de hoje." };
    if (response.status === 401) return { status: 401, texto: "Chave da IA inválida." };
    if (!response.ok) return { status: 502, texto: "O serviço de IA não conseguiu responder. Tente novamente em alguns instantes." };
    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content;
    if (typeof texto !== "string" || !texto.trim()) return { status: 502, texto: "A IA retornou uma resposta vazia. Tente novamente." };
    return { status: 200, texto };
  } catch (error) {
    return { status: 502, texto: error?.name === "TimeoutError" || error?.name === "AbortError"
      ? "A análise demorou demais. Aguarde um pouco e tente novamente."
      : "Não foi possível acessar a IA. Tente novamente em alguns instantes." };
  }
}
