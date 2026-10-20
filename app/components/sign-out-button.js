"use client";

import { useActionState } from "react";
import { signOut } from "../login/actions";

export default function SignOutButton() {
  const [state, action, pending] = useActionState(signOut, {});
  return (
    <form action={action}>
      <button className="botao botao-secundario" disabled={pending} type="submit">{pending ? "Saindo..." : "Sair"}</button>
      {state?.error && <p className="erro" role="alert">{state.error}</p>}
    </form>
  );
}
