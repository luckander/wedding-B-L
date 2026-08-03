import localFont from "next/font/local";
import "./globals.css";

const edwardianScript = localFont({
  src: "../public/fonts/edwardianscriptitc.ttf",
  variable: "--font-edwardian",
  display: "swap",
});

const oldStandard = localFont({
  src: "../public/fonts/OldStandardTT-Regular.ttf",
  variable: "--font-oldstandard",
  display: "swap",
});

export const metadata = {
  title: "Bheatriz & Lucas - Casamento",
  description:
    "Convidamos você para celebrar conosco o casamento de Bheatriz e Lucas em 13 de setembro de 2026.",
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
      className={`${edwardianScript.variable} ${oldStandard.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
