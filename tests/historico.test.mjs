import test from "node:test";
import assert from "node:assert/strict";
import { salvarAnalise, carregarHistorico } from "../lib/historico.js";

test("salvamento usa apenas os campos definidos, com rótulos, sem aceitar user_id do navegador", async () => {
  let linha;
  const supabase = { from: tabela => {
    assert.equal(tabela, "respostas");
    return { insert: async valor => { linha = valor; return { error: null }; } };
  } };
  await salvarAnalise(supabase, { mensagem: "Texto\nrecebido", contexto: "Outro campo", user_id: "outra-pessoa" },
    "Resposta\ncom quebras", { campos: [{ id: "mensagem", rotulo: "Mensagem" }, { id: "contexto", rotulo: "Contexto" }] });
  assert.deepEqual(linha, { entrada: "Mensagem:\nTexto\nrecebido\n\nContexto:\nOutro campo", resposta: "Resposta\ncom quebras" });
});

test("erro de gravação não é tratado como sucesso", async () => {
  const supabase = { from: () => ({ insert: async () => ({ error: { message: "private database error" } }) }) };
  await assert.rejects(salvarAnalise(supabase, { texto: "Texto" }, "Resposta", { campos: [{ id: "texto", rotulo: "Texto" }] }), /Não foi possível salvar/);
});

function bancoFake(linhas, falha = false) {
  return { from: tabela => {
    assert.equal(tabela, "respostas");
    let filtradas = [...linhas];
    const consulta = {
      select: () => consulta,
      eq: (coluna, valor) => { filtradas = filtradas.filter(linha => linha[coluna] === valor); return consulta; },
      order: (coluna, { ascending }) => {
        // O teste verifica o resultado da ordenação principal.
        if (coluna === "criado_em") filtradas.sort((a, b) => ascending ? a[coluna].localeCompare(b[coluna]) : b[coluna].localeCompare(a[coluna]));
        return consulta;
      },
      range: async (inicio, fim) => ({ data: filtradas.slice(inicio, fim + 1), count: filtradas.length, error: falha ? { message: "private" } : null })
    };
    return consulta;
  } };
}

test("cada conta recebe apenas suas análises, da mais recente para a mais antiga", async () => {
  const banco = bancoFake([
    { id: "1", user_id: "A", criado_em: "2026-10-20" },
    { id: "2", user_id: "B", criado_em: "2026-10-22" },
    { id: "3", user_id: "A", criado_em: "2026-10-21" }
  ]);
  assert.deepEqual((await carregarHistorico(banco, "A", 1)).itens.map(item => item.id), ["3", "1"]);
  assert.deepEqual((await carregarHistorico(banco, "B", 1)).itens.map(item => item.id), ["2"]);
});

test("paginação não perde registros e informa se existe outra página", async () => {
  const banco = bancoFake(Array.from({ length: 21 }, (_, i) => ({ id: String(i), user_id: "A", criado_em: "2026-10-22" })));
  const primeira = await carregarHistorico(banco, "A", 1);
  const segunda = await carregarHistorico(banco, "A", 2);
  assert.equal(primeira.itens.length, 20);
  assert.equal(primeira.temProxima, true);
  assert.equal(segunda.itens.length, 1);
  assert.equal(segunda.temProxima, false);
});

test("falha no banco e registros de outra conta são recusados, sem vazar conteúdo", async () => {
  await assert.rejects(carregarHistorico(bancoFake([], true), "A", 1), /Não foi possível carregar/);
  const consulta = { select: () => consulta, eq: () => consulta, order: () => consulta,
    range: async () => ({ data: [{ user_id: "B", entrada: "segredo" }], count: 1, error: null }) };
  await assert.rejects(carregarHistorico({ from: () => consulta }, "A", 1), /Não foi possível carregar/);
});
