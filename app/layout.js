import "./globals.css";

export const metadata = {
  title: "Bheatriz & Lucas - Casamento",
  description:
    "Convidamos voce para celebrar conosco o casamento de Bheatriz e Lucas em 13 de setembro de 2026.",
  keywords: "casamento, Bheatriz e Lucas, RSVP, lista de presentes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
