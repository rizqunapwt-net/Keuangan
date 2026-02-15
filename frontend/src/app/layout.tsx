import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Absensi Online | New Rizquna Elfath",
  description: "Portal Absensi Karyawan Mobile",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AuthProvider>
          <div className="app-container shadow-2xl">
            <main className="flex-1 overflow-y-auto safe-area-bottom">
              {children}
            </main>
            <Navigation />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
