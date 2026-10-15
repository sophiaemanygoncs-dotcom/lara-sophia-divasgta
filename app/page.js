"use client";

import { useState } from "react";

const TEXTOS = {
  titulo:<h1>Lara & Sophia 💜</h1>,
  subtitulo: "Digite um texto abaixo e clique em Analisar."
};

export default function Home() {
  const [entrada, setEntrada] = useState("");
  const [resposta, setResposta] = useState("");

  function analisar() {
    setResposta(entrada);
  }

  return (
    <main className="pagina">
      <section className="card">
        <h1>{TEXTOS.titulo}</h1>
        <p className="subtitulo">{TEXTOS.subtitulo}</p>

        <textarea
          className="campoTexto"
          value={entrada}
          onChange={(event) => setEntrada(event.target.value)}
          placeholder="Escreva aqui..."
          rows={6}
        />

        <button className="botao" type="button" onClick={analisar}>
          Analisar
        </button>

        <div className="resposta" aria-live="polite">
          {resposta}
        </div>
      </section>
    </main>
  );
}
