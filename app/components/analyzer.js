"use client";

import { useRef, useState } from "react";

export default function Analyzer({ desafio }) {
  const [campos, setCampos] = useState({});
  const [resposta, setResposta] = useState("");
  const [erro, setErro] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const emAndamento = useRef(false);

  async function analisar(event) {
    event.preventDefault();
    if (emAndamento.current) return;
    emAndamento.current = true;
    setAnalisando(true);
    setErro("");
    setResposta("");
    setSalvo(false);
    try {
      const response = await fetch("/api/ia", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campos), signal: AbortSignal.timeout(45000)
      });
      const texto = await response.text();
      if (!response.ok) {
        setErro(response.headers.get("content-type")?.includes("text/plain") && texto
          ? texto : "Não foi possível analisar a mensagem. Tente novamente.");
      } else {
        setResposta(texto);
        setSalvo(response.headers.get("X-Historico-Status") === "salvo");
        if (response.headers.get("X-Historico-Status") === "erro") {
          setErro("A análise foi concluída, mas não foi possível salvar no histórico. Copie a resposta para não perdê-la.");
        }
      }
    } catch {
      setErro("Não foi possível concluir a análise. Verifique sua conexão e tente novamente.");
    } finally {
      emAndamento.current = false;
      setAnalisando(false);
    }
  }

  return (
    <form onSubmit={analisar}>
      {desafio.campos.map(campo => (
        <div key={campo.id}>
          <label htmlFor={campo.id}>{campo.rotulo}</label>
          <textarea id={campo.id} name={campo.id} className="campoTexto" rows={campo.linhas}
            value={campos[campo.id] || ""} required maxLength={12000} disabled={analisando}
            onChange={event => setCampos(atuais => ({ ...atuais, [campo.id]: event.target.value }))} />
        </div>
      ))}
      <button className="botao" type="submit" disabled={analisando}>
        {analisando ? "Analisando..." : desafio.botao}
      </button>
      <p className="ajuda" style={{ marginTop: 12 }}>{desafio.aviso}</p>
      {desafio.modoTeste && <p className="ajuda">Modo de teste: resposta de exemplo, sem chamada à IA.</p>}
      {erro && <p className="erro" role="alert">{erro}</p>}
      {salvo && <p className="aviso" role="status">Análise salva no seu histórico.</p>}
      <div className="resposta" aria-live="polite" aria-busy={analisando}>{resposta}</div>
    </form>
  );
}
