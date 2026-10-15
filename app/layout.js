import "./globals.css";

export const metadata = {
  title: "Lara & Sophia",
  description: "Projeto criado durante a aula Do Zero ao Ar"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
