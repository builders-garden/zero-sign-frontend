import "./globals.css";
import { ReactNode } from "react";
import Providers from "./Providers";
import AppLayoutClient from "./AppLayoutClient";

export const metadata = {
  title: "ZeroSig",
  description: "ZeroSig Multisig App",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white min-h-screen">
        <Providers>
          <AppLayoutClient>{children}</AppLayoutClient>
        </Providers>
      </body>
    </html>
  );
}
