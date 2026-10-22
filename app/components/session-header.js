import Link from "next/link";
import SignOutButton from "./sign-out-button";

export default function SessionHeader({ email }) {
  return (
    <header className="sessao">
      <p>Conectada como <strong>{email}</strong></p>
      <nav className="acoes" aria-label="Navegação da conta">
        <Link href="/" className="link-conta">Analisar mensagem</Link>
        <Link href="/historico" className="link-conta">Meu histórico</Link>
        <SignOutButton />
      </nav>
    </header>
  );
}
