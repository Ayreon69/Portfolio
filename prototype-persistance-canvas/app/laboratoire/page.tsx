import Link from "next/link";

export default function Laboratoire() {
  return (
    <div style={{ padding: 48, maxWidth: 640 }}>
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>LABORATOIRE</h1>
      <p style={{ marginTop: 12 }}>
        Nouvelle route, nouveau contenu au-dessus du canvas — mais le système
        derrière a changé d&apos;état (couleur, vitesse de rotation) au lieu de
        se recréer.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← Retour au HERO
        </Link>
      </p>
    </div>
  );
}
