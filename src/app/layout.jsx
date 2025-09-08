import "./globals.css";
import Providers from "./providers";
import Navbar from "./components/Navbar";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = { title: "TurnPro" };

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.className}>
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
