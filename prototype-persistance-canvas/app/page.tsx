"use client";

import Link from "next/link";
import { useSystemVisibility } from "@/lib/system-visibility";

export default function Home() {
  const { hidden, toggle } = useSystemVisibility();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "28px clamp(20px, 5vw, 64px)",
      }}
    >
      <nav
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.06em",
          display: "flex",
          gap: 22,
          color: "#55534C",
        }}
      >
        <span>PROFIL</span>
        <span>LABORATOIRE</span>
        <span>PARCOURS</span>
        <span>CV</span>
        <span>CONTACT</span>
        <button
          type="button"
          onClick={toggle}
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.04em",
            padding: "6px 12px",
            border: "1px solid #1A1A18",
            background: hidden ? "#1A1A18" : "transparent",
            color: hidden ? "#F4EFE4" : "#1A1A18",
            cursor: "pointer",
          }}
        >
          {hidden ? "RÉVÉLER LE SYSTÈME" : "MASQUER LE SYSTÈME"}
        </button>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 720 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(48px, 9vw, 108px)",
              lineHeight: 0.98,
              margin: "0 0 28px",
              textWrap: "balance" as const,
            }}
          >
            RAYAN JEMAI
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(16px, 2.2vw, 22px)",
              color: "#55534C",
              margin: "0 0 14px",
            }}
          >
            « Je n&apos;aime pas faire deux fois la même chose. »
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              letterSpacing: "0.14em",
              margin: 0,
            }}
          >
            DATA SCIENTIST / BUILDER
          </p>
        </div>
      </div>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.05em",
          color: "#55534C",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Link
          href="/data-dna"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          [ 01 ] EXPLORER LE SYSTÈME →
        </Link>
        <Link
          href="/laboratoire"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          voir la persistance du canvas (§07.1) →
        </Link>
      </div>
    </div>
  );
}
