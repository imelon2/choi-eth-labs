import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "choi.eth Labs - EVM Blockchain Tools",
  description: "Comprehensive blockchain data analysis platform by choi.eth for EVM blockchain developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>choi.eth Labs - EVM Blockchain Tools</title>
        <meta name="description" content="Comprehensive blockchain data analysis platform - Built by choi.eth for EVM blockchain developers" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <ThemeProvider defaultTheme="dark" enableSystem>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
