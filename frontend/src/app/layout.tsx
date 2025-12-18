import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Absensi Online",
  description: "Admin frontend scaffold",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold">Absensi Online</Link>
            <nav className="flex items-center gap-4">
              <Link href="/admin" className="text-sm font-medium text-gray-700">Admin</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
