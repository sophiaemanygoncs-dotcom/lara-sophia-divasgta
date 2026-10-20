"use client";

import { useState } from "react";

export default function Analyzer() {
  const [entrada, setEntrada] = useState("");
  const [resposta, setResposta] = useState("");
  return (
    <>
      <label className="subtitulo" htmlFor="entrada">Digite um texto abaixo e clique em Analisar.</label>
      <textarea id="entrada" className="campoTexto" value={entrada} onChange={event => setEntrada(event.target.value)} placeholder="Escreva aqui..." rows={6} />
      <button className="botao" type="button" onClick={() => setResposta(entrada)}>Analisar</button>
      <div className="resposta" aria-live="polite">{resposta}</div>
    </>
  );
}
