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
  user_banned: "Esta conta está temporariamente bloqueada."
};

export function authErrorMessage(error) {
  return messages[error?.code] ||
    "Não foi possível concluir a operação. Verifique sua conexão e tente novamente.";
}

export const configurationError = "O login ainda não foi configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) e publique o site novamente.";
