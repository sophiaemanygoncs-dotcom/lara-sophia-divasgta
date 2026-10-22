import test from "node:test";
import assert from "node:assert/strict";
import { desafio } from "../desafio.js";
import { analisarMensagem } from "../lib/ia.js";

test("modo de teste devolve exemplo sem chave e sem chamada à IA", async () => {
  const resultado = await analisarMensagem({ mensagem: "Reunião de pais amanhã." }, {
    desafio: { ...desafio, modoTeste: true }, fetcher: () => assert.fail("O modo de teste não pode chamar a OpenRouter")
  });
  assert.equal(resultado.status, 200);
  assert.match(resultado.texto, /EXEMPLO DE TESTE/);
  assert.match(resultado.texto, /VEREDITO:/);
});

test("campos inválidos ou longos são recusados antes de usar a IA", async () => {
  for (const campos of [null, [], {}, { mensagem: "  " }, { mensagem: 42 }, { mensagem: "x".repeat(12001) }]) {
    const resultado = await analisarMensagem(campos, { desafio, fetcher: () => assert.fail("Entrada inválida") });
    assert.equal(resultado.status, 400);
  }
});

test("modo real exige a chave do servidor", async () => {
  const resultado = await analisarMensagem({ mensagem: "Texto" }, { desafio: { ...desafio, modoTeste: false } });
  assert.equal(resultado.status, 503);
  assert.match(resultado.texto, /OPENROUTER_API_KEY/);
});

test("modo real envia modelo, limite e texto, preservando marcadores recebidos", async () => {
  const config = { ...desafio, modoTeste: false, campos: [{ id: "mensagem" }, { id: "outro" }], prompt: "Mensagem: {mensagem}; outro: {outro}" };
  const resultado = await analisarMensagem({ mensagem: "Mensagem com {outro} e $&", outro: "outro campo" }, {
    desafio: config, apiKey: "test-key", fetcher: async (url, options) => {
      assert.equal(url, "https://openrouter.ai/api/v1/chat/completions");
      assert.equal(options.headers.Authorization, "Bearer test-key");
      const body = JSON.parse(options.body);
      assert.equal(body.model, "openrouter/free");
      assert.equal(body.max_tokens, 900);
      assert.equal(body.messages[0].content, "Mensagem: Mensagem com {outro} e $&; outro: outro campo");
      return Response.json({ choices: [{ message: { content: "VEREDITO: SUSPEITO\nPOR QUE: teste" } }] });
    }
  });
  assert.equal(resultado.status, 200);
  assert.equal(resultado.texto, "VEREDITO: SUSPEITO\nPOR QUE: teste");
});

test("erros da OpenRouter são traduzidos sem expor o conteúdo do provedor", async () => {
  for (const [status, mensagem] of [[401, "Chave da IA inválida."], [429, "Você atingiu o limite de uso de hoje."], [503, "O serviço de IA não conseguiu responder."]]) {
    const resultado = await analisarMensagem({ mensagem: "Teste" }, {
      desafio: { ...desafio, modoTeste: false }, apiKey: "test-key",
      fetcher: async () => new Response("private provider error", { status })
    });
    assert.equal(resultado.status, status === 503 ? 502 : status);
    assert(resultado.texto.startsWith(mensagem));
    assert(!resultado.texto.includes("private"));
  }
});

test("resposta vazia, JSON inválido e timeout não deixam a análise pendente", async () => {
  const fetchers = [
    async () => Response.json({ choices: [] }),
    async () => new Response("not-json"),
    async () => { throw new DOMException("Timeout", "TimeoutError"); }
  ];
  for (const fetcher of fetchers) {
    const resultado = await analisarMensagem({ mensagem: "Teste" }, { desafio: { ...desafio, modoTeste: false }, apiKey: "test-key", fetcher });
    assert.equal(resultado.status, 502);
    assert(resultado.texto.length > 0);
  }
});
