import Contact from "@/components/sections/Contact";
import CV from "@/components/sections/CV";
import Hero from "@/components/sections/Hero";
import Laboratoire from "@/components/sections/Laboratoire";
import Parcours from "@/components/sections/Parcours";
import Philosophy from "@/components/sections/Philosophy";
import Profil from "@/components/sections/Profil";

/**
 * Homepage.
 *
 * Flux complet : HERO → PHILOSOPHIE → PROFIL → LABORATOIRE → PARCOURS → CV →
 * CONTACT (§05, parcours naturel). Les sept sections sont en place.
 *
 * Aucun `use client` dans cette chaîne : la page est entièrement rendue côté
 * serveur, donc lisible sans JavaScript.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Philosophy />
      <Profil />
      <Laboratoire />
      <Parcours />
      <CV />
      <Contact />
    </>
  );
}
