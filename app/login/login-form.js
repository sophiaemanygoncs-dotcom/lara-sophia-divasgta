"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";

export default function LoginForm({ configurationError, confirmationError }) {
  const [state, action, pending] = useActionState(authenticate, {});
  const error = configurationError || state.error || confirmationError;
  return (
    <form action={action} className="formulario" noValidate>
      <label htmlFor="email">E-mail</label>
      <input id="email" name="email" type="email" autoComplete="email" required className="campoTexto"
        placeholder="voce@exemplo.com" aria-describedby={error ? "login-error" : undefined} />
      <label htmlFor="password">Senha</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required
        className="campoTexto" placeholder="Digite sua senha" aria-describedby="password-help" />
      <p id="password-help" className="ajuda">Para criar uma conta, use uma senha com pelo menos 6 caracteres.</p>
      {error && <p id="login-error" className="erro" role="alert">{error}</p>}
      {state.message && <p className="aviso" role="status">{state.message}</p>}
      <div className="acoes">
        <button className="botao" type="submit" name="intent" value="login" disabled={pending || !!configurationError}>Entrar</button>
        <button className="botao botao-secundario" type="submit" name="intent" value="signup" disabled={pending || !!configurationError}>Criar conta</button>
      </div>
      {pending && <p role="status">Aguarde...</p>}
    </form>
  );
}
