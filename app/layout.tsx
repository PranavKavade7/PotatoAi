import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SubscribeBar from '@/components/SubscribeBar';

export const metadata: Metadata = {
  title: "PotatoAi — India's AI Intelligence Platform",
  description: 'Daily AI news, model comparisons, and company updates — made for India.',
};

function Navigation() {
  return (
    <header style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
      <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>
          PotatoAi
        </Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/news" style={{ fontSize: 14, color: '#1a1a1a', textDecoration: 'none' }}>News</Link>
          <Link href="/models" style={{ fontSize: 14, color: '#1a1a1a', textDecoration: 'none' }}>Models</Link>
          <Link href="/companies" style={{ fontSize: 14, color: '#1a1a1a', textDecoration: 'none' }}>Companies</Link>
          <Link href="/glossary" style={{ fontSize: 14, color: '#1a1a1a', textDecoration: 'none' }}>Glossary</Link>
          <Link href="/admin" style={{ fontSize: 14, color: '#1a1a1a', textDecoration: 'none' }}>Admin</Link>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #e5e7eb', marginTop: 64, padding: '32px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/news" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}>News</Link>
          <Link href="/models" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}>Models</Link>
          <Link href="/companies" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}>Companies</Link>
          <Link href="/glossary" style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}>Glossary</Link>
        </div>
        <span style={{ fontSize: 14, color: '#6b7280' }}>Made in India</span>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1a1a1a', background: '#ffffff', margin: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <main style={{ flex: 1 }}>{children}</main>
        <SubscribeBar />
        <Footer />
      </body>
    </html>
  );
}
