import "./globals.css";
import localFont from "next/font/local";

const nunito = localFont({
  src: "./fonts/Nunito-Variable.ttf",
  variable: "--fonte-titulos",
  weight: "200 1000",
  display: "swap"
});

export const metadata = {
  title: "Isso é golpe? | Lara e Sophia",
  description: "Uma ajuda para reconhecer sinais de golpe em mensagens suspeitas."
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body>
        {children}
        <footer className="rodape">Feito por Lara e Sophia · Do Zero ao Ar · Afesu Veleiros 2026</footer>
      </body>
    </html>
  );
}
