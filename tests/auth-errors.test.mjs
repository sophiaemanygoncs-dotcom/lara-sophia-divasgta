import test from "node:test";
import assert from "node:assert/strict";
import { authErrorMessage } from "../lib/supabase/errors.js";
import { getSupabaseConfig } from "../lib/supabase/config.js";

test("uma chave recusada pelo gateway não é apresentada como falha de conexão", () => {
  assert.match(authErrorMessage({ status: 401, message: "Invalid API key" }), /chave pública.*recusada/);
  assert.match(authErrorMessage({ message: "No API key found in request" }), /chave pública.*recusada/);
});

test("erros de autenticação conhecidos têm prioridade sobre o status HTTP", () => {
  assert.equal(authErrorMessage({ status: 401, code: "invalid_credentials" }), "E-mail ou senha incorretos.");
  assert.equal(authErrorMessage({ status: 400, code: "email_not_confirmed" }), "Confirme seu e-mail antes de entrar.");
});

test("falhas de projeto, limite e serviço têm orientações distintas em português", () => {
  assert.match(authErrorMessage({ status: 404 }), /projeto Supabase não foi encontrado/);
  assert.match(authErrorMessage({ status: 429 }), /Muitas tentativas/);
  assert.match(authErrorMessage({ status: 503 }), /erro interno/);
  assert.match(authErrorMessage({ name: "AuthRetryableFetchError" }), /Não foi possível conectar ao Supabase/);
});

test("mensagens desconhecidas do provedor não são exibidas diretamente", () => {
  const message = authErrorMessage({ code: "unknown", message: "English error with private diagnostic data" });
  assert.match(message, /Não foi possível concluir/);
  assert.doesNotMatch(message, /English|private diagnostic/);
});

test("a chave publishable atual prevalece sobre uma anon antiga e espaços são removidos", () => {
  const names = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
  const original = names.map(name => process.env[name]);
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = " https://example.supabase.co \n";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "old-anon-key";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = " sb_publishable_current \n";
    assert.deepEqual(getSupabaseConfig(), { url: "https://example.supabase.co", key: "sb_publishable_current" });
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = " \n";
    assert.equal(getSupabaseConfig().key, "old-anon-key");
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    assert.equal(getSupabaseConfig(), null);
  } finally {
    names.forEach((name, i) => {
      if (original[i] === undefined) delete process.env[name];
      else process.env[name] = original[i];
    });
  }
});
