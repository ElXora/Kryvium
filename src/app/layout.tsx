import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Kryvium — AI for coding and complex problems",
  description:
    "Kryvium is an AI assistant built for coding and solving complex technical problems.",
  icons: {
    icon: "/logo-32.png",
    apple: "/logo-192.png",
  },
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('kryvium-theme');
    var theme = stored || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
