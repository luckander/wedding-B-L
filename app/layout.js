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
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${edwardianScript.variable} ${oldStandard.variable}`}
    >
      <head>
        <link rel="preload" as="image" href="/images/dress-code.jpg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
