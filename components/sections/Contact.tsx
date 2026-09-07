import { channels } from "@/lib/identity";
import styles from "./Contact.module.css";

/**
 * CONTACT — §08.7. Seule section sur fond noir (§03.3, chorégraphie des fonds).
 *
 * Aucun formulaire : le blueprint prévoit trois canaux, pas un mécanisme
 * d'envoi. Un formulaire supposerait un backend, un anti-spam et un stockage
 * de messages — trois choses qu'aucune décision n'a validées.
 *
 * Les adresses viennent de lib/identity.ts, jamais écrites ici. Chaque canal
 * affiche l'adresse elle-même plutôt qu'un libellé : c'est la dernière chose
 * que lit un recruteur, il doit pouvoir la copier sans cliquer.
 */
export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-titre"
      className={styles.section}
    >
      <div className={styles.inner}>
        <p className={`mono ${styles.eyebrow}`}>
          <span aria-hidden="true">06 — </span>Contact
        </p>

        <h2 id="contact-titre" className={styles.title}>
          Construisons quelque chose.
        </h2>

        <p className={styles.invite}>
          Un problème qui mérite d&apos;être automatisé&nbsp;?
        </p>

        <ul className={styles.channels}>
          {channels.map((c) => (
            <li key={c.id} className={styles.channel}>
              <span className={`mono ${styles.channelLabel}`}>{c.label}</span>{" "}
              <a
                className={styles.channelLink}
                href={c.href}
                rel="noreferrer noopener"
              >
                {c.display}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
