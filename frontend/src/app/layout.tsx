import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FAB005",
};

export const metadata = {
  title: "Absensi Online | New Rizquna Elfath",
  description: "Portal Absensi Karyawan Mobile",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rizquna Absensi",
  },
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
