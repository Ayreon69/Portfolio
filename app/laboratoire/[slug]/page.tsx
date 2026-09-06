import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projectBySlug, projects } from "@/lib/laboratoire/source";
import AramFallback from "@/components/univers/aram/AramFallback";
import AramUniverse from "@/components/univers/aram/AramUniverse";
import AiWatchUniverse from "@/components/univers/ai-watch/AiWatchUniverse";
import JobAgentUniverse from "@/components/univers/job-agent/JobAgentUniverse";
import CommissionBotUniverse from "@/components/univers/commission-bot/CommissionBotUniverse";
import styles from "./page.module.css";

/**
 * Page expérimentation — SQUELETTE.
 *
 * Les six sections du §09.2 sont en place et alimentées par data/nodes.json.
 * Là où le blueprint n'a pas encore de contenu (`construction`, `donnees`, et
 * `recul` sur quatre projets), la section affiche « Contenu à intégrer »
 * plutôt qu'un texte inventé : le squelette dit la vérité sur son état.
 *
 * UNIVERS (§09.3). Un univers vit DANS la section 03 SYSTÈME, dans le flux
 * normal de lecture : pas de route, pas de plein écran, pas de navigation
 * nouvelle. Il s'ajoute sous la chaîne du pipeline, qui reste l'état de repos
 * et le plan de lecture. Seul ARAM en a un à ce stade.
 *
 * `generateStaticParams` prérend les 5 slugs : ces routes sont statiques, donc
 * lisibles sans JavaScript et sans WebGL, comme la homepage.
 */

const STATUS_LABEL: Record<string, string> = {
  live: "En ligne",
  archived: "Archivé",
  lost: "Implémentation d'origine perdue",
};

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug.get(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Rayan Jemai`,
    description: project.friction ?? undefined,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug.get(slug);
  if (!project) notFound();

  return (
    <article
      className={styles.page}
      // §03.3 : un accent projet n'apparaît QUE sur la page de son projet.
      // C'est le seul endroit du site où cette variable est lue.
      style={
        {
          "--accent": `var(--accent-${project.slug}, var(--ink))`,
        } as CSSProperties
      }
    >
      <p className={`mono ${styles.back}`}>
        <Link href="/#laboratoire">← Laboratoire</Link>
      </p>

      <header className={styles.header}>
        <p className={`mono ${styles.eyebrow}`}>
          Expérimentation {project.number}
        </p>
        <h1 className={styles.title}>{project.title}</h1>
        {project.subtitle && (
          <p className={styles.subtitle}>{project.subtitle}</p>
        )}

        <dl className={`mono ${styles.facts}`}>
          {project.year && (
            <div className={styles.fact}>
              <dt>Année</dt>
              <dd>{project.year}</dd>
            </div>
          )}
          {project.universe && (
            <div className={styles.fact}>
              <dt>Univers</dt>
              <dd>{project.universe}</dd>
            </div>
          )}
          <div className={styles.fact}>
            <dt>Preuve</dt>
            <dd>{project.proof}</dd>
          </div>
          {project.status && STATUS_LABEL[project.status] && (
            <div className={styles.fact}>
              <dt>Statut</dt>
              <dd>{STATUS_LABEL[project.status]}</dd>
            </div>
          )}
        </dl>

        {project.metric && (
          <p className={styles.metric}>
            <span className={styles.metricValue}>{project.metric.value}</span>
            <span className={`mono ${styles.metricLabel}`}>
              {project.metric.label}
            </span>
          </p>
        )}

        {(project.links?.live || project.links?.repo) && (
          <p className={`mono ${styles.links}`}>
            {project.links.live && (
              <a href={project.links.live} rel="noreferrer noopener">
                Voir la démo ↗
              </a>
            )}
            {project.links.repo && (
              <a href={project.links.repo} rel="noreferrer noopener">
                Dépôt public ↗
              </a>
            )}
          </p>
        )}
      </header>

      {project.sections.map((s) => (
        <section key={s.number} className={styles.block}>
          <h2 className={`mono ${styles.blockTitle}`}>
            <span aria-hidden="true">{s.number} — </span>
            {s.label}
          </h2>
          {s.chain && (
            <p className={`mono ${styles.chain}`}>
              {s.chain.map((step, i) => (
                <span key={step} className={styles.chainStep}>
                  {i > 0 && (
                    <>
                      <span className={styles.chainArrow} aria-hidden="true">
                        →
                      </span>{" "}
                    </>
                  )}
                  {step}{" "}
                </span>
              ))}
            </p>
          )}

          {s.paragraphs.map((text) => (
            <p key={text.slice(0, 40)} className={styles.blockBody}>
              {text}
            </p>
          ))}

          {/* L'univers s'ajoute au texte de 03, il ne le remplace jamais :
              la section reste complète et lisible sans lui. Le repli est rendu
              par le serveur ; le composant client ne fait que l'enrichir là où
              c'est justifié (pointeur fin, écran large). */}
          {slug === "aram-stats" && s.number === "03" && (
            <AramUniverse>
              <AramFallback />
            </AramUniverse>
          )}

          {slug === "ai-watch" && s.number === "03" && <AiWatchUniverse />}

          {slug === "job-agent" && s.number === "03" && <JobAgentUniverse />}

          {slug === "commission-bot" && s.number === "03" && <CommissionBotUniverse />}

          {s.stack && (
            <p className={`mono ${styles.stack}`}>{s.stack.join(" · ")}</p>
          )}

          {s.paragraphs.length === 0 && !s.chain && !s.stack && (
            <p className={`mono ${styles.pending}`}>Contenu à intégrer.</p>
          )}
        </section>
      ))}
    </article>
  );
}
