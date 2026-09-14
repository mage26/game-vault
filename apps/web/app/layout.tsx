import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Game Vault',
  description: 'Browse your game collection',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-[var(--border)] px-6 py-4">
          <h1 className="text-xl font-semibold tracking-wide text-[var(--accent)]">
            Game Vault
          </h1>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
