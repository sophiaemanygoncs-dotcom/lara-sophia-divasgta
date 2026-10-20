const messages = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
  user_already_exists: "Não foi possível criar a conta. Tente entrar ou use outro e-mail.",
  email_exists: "Não foi possível criar a conta. Tente entrar ou use outro e-mail.",
  weak_password: "Escolha uma senha mais forte, com pelo menos 6 caracteres, letras e números.",
  over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  over_email_send_rate_limit: "Limite de envio de e-mails atingido. Aguarde e tente novamente.",
  email_address_invalid: "Digite um e-mail válido.",
  email_address_not_authorized: "Este e-mail não está autorizado para cadastro. Entre em contato com a responsável pelo site.",
  signup_disabled: "O cadastro de novas contas está desativado no momento.",
  user_banned: "Esta conta está temporariamente bloqueada.",
  email_provider_disabled: "O login por e-mail está desativado no Supabase. Ative-o em Authentication → Sign In / Providers.",
  request_timeout: "O Supabase demorou para responder. Aguarde e tente novamente.",
  unexpected_failure: "O Supabase encontrou um erro interno. Tente novamente em alguns instantes.",
  hook_timeout: "O serviço de autenticação demorou para responder. Tente novamente.",
  hook_timeout_after_retry: "O serviço de autenticação demorou para responder. Tente novamente."
};

export function authErrorMessage(error) {
  if (messages[error?.code]) return messages[error.code];

  // O gateway do Supabase pode responder sem um código de AuthApiError.
  // Não exiba a mensagem original: ela pode estar em inglês ou conter dados.
  if (error?.status === 401 || /invalid api key|no api key found/i.test(error?.message || "")) {
    return "A chave pública do Supabase foi recusada. Na Vercel, confira NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY), usando a chave do mesmo projeto da URL, e faça um novo deploy.";
  }
  if (error?.status === 404) {
    return "O projeto Supabase não foi encontrado. Confira NEXT_PUBLIC_SUPABASE_URL na Vercel e se o projeto está ativo no Supabase.";
  }
  if (error?.status === 429) return messages.over_request_rate_limit;
  if (error?.status >= 500) return messages.unexpected_failure;
  if (error?.name === "AuthRetryableFetchError") {
    return "Não foi possível conectar ao Supabase. Confira a URL do projeto na Vercel e se ele está ativo no Supabase.";
  }
  return "Não foi possível concluir a operação. Tente novamente em alguns instantes.";
}

export const configurationError = "O login ainda não foi configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) e publique o site novamente.";
