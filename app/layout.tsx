import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SubscribeBar from '@/components/SubscribeBar';

export const metadata: Metadata = {
  title: "PotatoAi — India's AI Intelligence Platform",
  description: 'Daily AI news, model comparisons, and company updates — made for India.',
};

const NAV_LINKS = [
  { href: '/news', label: 'News' },
  { href: '/models', label: 'Models' },
  { href: '/companies', label: 'Companies' },
  { href: '/compare', label: 'Compare' },
  { href: '/deals', label: 'Deals' },
  { href: '/glossary', label: 'Glossary' },
];

function Navigation() {
  return (
    <header style={{ borderBottom: '1px solid #e5e7eb', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
      <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 6, background: '#1877F2', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>P</span>
          PotatoAi
        </Link>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              style={{
                fontSize: 14, color: '#374151', textDecoration: 'none',
                padding: '6px 12px', borderRadius: 6, fontWeight: 500,
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="nav-link"
            style={{
              fontSize: 13, color: '#6b7280', textDecoration: 'none',
              padding: '6px 12px', borderRadius: 6, marginLeft: 8,
            }}
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #e5e7eb', marginTop: 64, padding: '40px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 28, height: 28, borderRadius: 6, background: '#1877F2', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>P</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>PotatoAi</span>
            </div>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5, maxWidth: 320 }}>
              India&apos;s AI intelligence platform. Track models, companies, and the stories shaping AI — built for builders and researchers.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explore</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/news" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>News</Link>
              <Link href="/models" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>Models</Link>
              <Link href="/companies" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>Companies</Link>
              <Link href="/compare" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>Compare</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/deals" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>Deals</Link>
              <Link href="/glossary" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>Glossary</Link>
              <Link href="/admin" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>Admin</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</h4>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
              Made in India with care for the AI community.
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>© 2026 PotatoAi. All rights reserved.</span>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>Made in India</span>
        </div>
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
