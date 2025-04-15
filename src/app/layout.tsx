import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Layout from '@/components/Layout';
import FluidBackground from '@/components/FluidBackground';

export const metadata: Metadata = {
  title: 'Faithful App',
  description: 'Track health goals, journal, and more with Faithful App',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FluidBackground />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}