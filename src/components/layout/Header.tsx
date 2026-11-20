"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Glyph } from "@/components/common/Glyph";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/emisoras", label: "Emisoras" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/favoritos", label: "Favoritos" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Radio Leonida — inicio">
        <span className="brand__mark">
          <Glyph name="wave" />
        </span>
        <span className="brand__text">
          <strong>RADIO</strong>
          <span>LEONIDA</span>
        </span>
        <span className="brand__onair">ON AIR</span>
      </Link>

      <nav className="main-nav" aria-label="Navegación principal">
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
