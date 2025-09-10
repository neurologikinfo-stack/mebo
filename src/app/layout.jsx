import "./globals.css";
import Providers from "./providers";
import Navbar from "./components/Navbar";
import { Inter } from "next/font/google";
import clsx from "clsx";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = { title: "mebo" };

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <Providers>
          <Navbar />
          <main className="p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
