import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import MobileBottomCartBar from '@/components/MobileBottomCartBar';
import FloatingSocialBalloon from '@/components/FloatingSocialBalloon';

export const metadata: Metadata = {
  title: "De'nish Cookies — Making Taste Better | Premium Homemade Cookies",
  description:
    "Toko kue kering homemade premium terpercaya sejak 2018. Menggunakan 100% Wijsman butter asli untuk Nastar, Kastengel Edam, Putri Salju, dan Hampers Eksklusif. Pengiriman aman se-Indonesia via Gojek Instant & Paxel Cold-Chain.",
  keywords: [
    "De'nish Cookies",
    "Kue Kering Nastar Wisman",
    "Kastengel Keju Edam",
    "Hampers Lebaran Bandung",
    "Kue Kering Bandung",
    "Paxel Luar Kota",
    "Gojek Instant Bandung",
  ],
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* OpenStreetMap Leaflet stylesheet */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* Midtrans Snap JS (Sandbox) */}
        <script
          type="text/javascript"
          src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js'}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-mock'}
          async
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <MobileBottomCartBar />
            <FloatingSocialBalloon />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
