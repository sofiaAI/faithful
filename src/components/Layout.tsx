'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = pathname !== '/login';

  return (
    <>
      {showNavbar && <Navbar />}
      <main className="p-6">{children}</main>
    </>
  );
}
