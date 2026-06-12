import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ["latin"], variable: '--font-orbitron' });

export const metadata = {
  title: "Free Fire Championship Arena | Premium Esports Tournaments",
  description: "Compete in premium esports tournaments, qualify through brackets, and win real rewards. Join Solo, Duo, and Squad tournaments today.",
};

import { Providers } from "../components/Providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${orbitron.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
