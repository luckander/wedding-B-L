import { Inter, Cormorant_Garamond, Great_Vibes, Dancing_Script } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata = {
  title: "Bheatriz & Lucas - Casamento",
  description:
    "Convidamos voce para celebrar conosco o casamento de Bheatriz e Lucas em 13 de setembro de 2026.",
  keywords: "casamento, Bheatriz e Lucas, RSVP, lista de presentes",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${cormorantGaramond.variable} ${greatVibes.variable} ${dancingScript.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
