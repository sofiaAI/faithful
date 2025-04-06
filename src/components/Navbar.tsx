'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/goals", label: "Goals" },
  { href: "/astro", label: "Astro" },
  { href: "/login", label: "Login" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow p-4 flex gap-4 sticky top-0 z-10">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`hover:underline ${pathname === link.href ? "font-bold text-blue-600" : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
