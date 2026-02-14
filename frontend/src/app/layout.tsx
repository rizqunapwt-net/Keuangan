import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Absensi Online",
  description: "System Absensi Online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-indigo-500/30">
        <div className="nebula" />
        <AuthProvider>
          <main className="relative">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
