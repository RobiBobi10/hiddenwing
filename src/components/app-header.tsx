"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { WingLogo } from "./brand";

const TABS = [
  { href: "/", label: "Flights" },
  { href: "/stays", label: "Stays" },
  { href: "/cars", label: "Cars" },
  { href: "/trips", label: "Trips" },
];

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="appbar">
      <Link
        href="/"
        className="brand"
        style={{ marginBottom: 0, textDecoration: "none", color: "var(--text)" }}
      >
        <WingLogo size={24} />
        <span className="brand-name">Hiddenwing</span>
      </Link>

      <nav className="appnav">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={`navlink${active ? " navlink-active" : ""}`}>
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="appbar-user">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className="navlink">
            Sign in
          </Link>
        </SignedOut>
      </div>
    </header>
  );
}
