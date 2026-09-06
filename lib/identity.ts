// Coordonnées et CV — SOURCE UNIQUE.
//
// Les sections CV et CONTACT ne connaissent aucune adresse : elles lisent ce
// module. Renseigner une valeur ici la met en ligne, la retirer la retire.
//
// Ces coordonnées sont publiées à la demande explicite de Rayan (2026-09-06).
// Le PDF servi est `public/CV_Rayan_Jemai_2026.pdf` : il contient un numéro de
// téléphone personnel. C'est un choix assumé — un CV se publie avec ses moyens
// de contact — mais il vaut d'être connu avant de rendre le dépôt public.

export type Channel = {
  id: "email" | "linkedin" | "github";
  label: string;
  href: string;
  /** Ce qui s'affiche : l'adresse elle-même, lisible sans survol. */
  display: string;
};

export const channels: Channel[] = [
  {
    id: "email",
    label: "Email",
    href: "mailto:rayan.j@outlook.fr",
    display: "rayan.j@outlook.fr",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/rayan-jemai/",
    display: "linkedin.com/in/rayan-jemai",
  },
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/Ayreon69",
    display: "github.com/Ayreon69",
  },
];

/**
 * CV PDF servi par le site, depuis `public/`. Le même fichier sert au bouton
 * « Voir le CV » (ouverture dans un onglet) et au téléchargement : c'est le
 * navigateur, via `download`, qui fait la différence — pas deux fichiers.
 */
export const cvPdf = "/CV_Rayan_Jemai_2026.pdf";

/** Nom du fichier proposé au téléchargement. */
export const cvFileName = "CV_Rayan_Jemai_2026.pdf";
