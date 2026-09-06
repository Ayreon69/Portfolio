import type { ProjectContent } from "@/lib/laboratoire/derive";

/**
 * JOB AGENT — contenu éditorial des six sections (§09.2).
 *
 * Toute la matière vient de PORTFOLIO-SOURCE-DE-VERITE-v4.md : §04.4.01
 * (grille d'extraction), §09.5 (tableau projet), §09.3 (chaîne du pipeline).
 * Ce fichier REFORMULE, il n'ajoute aucun fait : ni chiffre, ni techno, ni
 * comportement qui ne soit dans le blueprint.
 *
 * Il vit hors de data/ : data/nodes.json est le Data DNA (gelé), pas un CMS.
 * La friction courte du graphe reste celle de la galerie ; celle d'ici est la
 * version longue, propre à la page.
 */
const jobAgent: ProjectContent = {
  friction: {
    paragraphs: [
      "Chercher un poste sur plusieurs zones géographiques en parallèle, c'est refaire chaque jour la même séquence : ouvrir plusieurs sites, lire chaque offre en entier, juger si elle correspond vraiment, puis adapter l'angle de la candidature.",
      "Le travail n'est pas difficile. Il est répétitif, et il ne tient pas à l'échelle : chaque zone ajoutée rajoute la séquence complète.",
    ],
  },

  construction: {
    paragraphs: [
      "Un pipeline multi-agents qui va du scraping jusqu'à une analyse rédigée : collecte des offres sur Hellowork et jobup.ch, indexation RAG du profil candidat, agent de scoring, agent de génération d'analyse structurée, puis une API et un dashboard de tri manuel.",
      "Ce qui le sépare d'un script, c'est l'orchestrateur : il prend de vraies décisions — re-scraping ciblé, statut « incertain » assumé, gestion explicite des échecs — au lieu d'enchaîner les étapes sans condition.",
      "Un garde-fou n'est pas négociable : aucune soumission automatique de candidature. Le pipeline s'arrête à l'analyse, et la validation humaine reste le seul chemin vers une action externe.",
    ],
  },

  system: {
    // §09.3 — la chaîne telle qu'elle est écrite dans le blueprint.
    chain: ["JOB SOURCES", "[ AGENT · AGENT · AGENT ]", "FILTER", "MATCH", "OUTPUT"],
    paragraphs: [
      "Le RAG est écrit à la main, sans LangChain : embeddings multilingues locaux via sentence-transformers, indexation vectorielle dans ChromaDB, et une recherche par atome de compétence — pas par exigence composite — avec un seuil de bruit calculé dynamiquement.",
      "Le scoring combine trois régimes volontairement distincts : la géographie est traitée en déterministe, hors du RAG ; le rapprochement de compétences passe par la recherche sémantique ; l'arbitrage final revient à un agent LLM (API Mistral), qui extrait aussi les exigences de l'offre et rédige l'analyse structurée.",
      "L'ensemble tourne seul : scraping programmé par cron quotidien sur GitHub Actions, pipeline de bout en bout sans intervention jusqu'à l'analyse, nettoyage automatique des offres obsolètes, persistance par commit CI.",
    ],
  },

  donnees: {
    paragraphs: [
      "107 offres scorées — 73 sur Hellowork, 34 sur jobup.ch — dans un schéma SQLite tenu par des migrations explicites.",
      "Chaque offre porte trois niveaux de trace JSON. N'importe quelle décision du pipeline peut être rouverte et auditée a posteriori, étape par étape.",
    ],
    stack: [
      "Python 3.11",
      "Playwright",
      "SQLite",
      "ChromaDB",
      "sentence-transformers",
      "API Mistral",
      "FastAPI",
      "Docker",
      "GitHub Actions",
      "Render.com",
    ],
  },

  result: {
    paragraphs: [
      "Le résultat le plus intéressant n'est pas le volume : la granularité atomique du RAG détecte des gaps de compétence qu'une recherche composite manque silencieusement. Vérifié sur un cas réel — une offre exigeant la norme ISO 13485.",
      "Le système est honnête par construction : il ne fabrique jamais une compétence, et signale un manque explicitement plutôt que de le masquer dans un score global.",
    ],
  },

  // 06 — RECUL : rédigé par Rayan (2026-09-06). C'est la seule section dont la
  // matière ne vient pas du blueprint — celui-ci ne contient aucun recul écrit
  // ni aucune suite de projet. Reproduite telle qu'elle a été fournie.
  recul: {
    paragraphs: [
      "Le système fonctionne aujourd'hui comme un jugement contre un profil statique : CV et critères alimentent le scoring, mais les décisions prises au fil des sessions ne retournent pas encore dans la boucle.",
      "Le principal axe que je développerais serait donc une boucle de réapprentissage à partir des verdicts utilisateur. Les décisions « intéressante » / « pas pour moi » sont déjà conservées dans user_verdict, mais ne nourrissent pas encore le scoring. Avec suffisamment de verdicts, je pourrais les réinjecter dans ChromaDB comme exemples afin que l'agent affine progressivement son jugement à partir des décisions réelles plutôt que du seul profil initial.",
      "Ce mécanisme devrait cependant attendre un volume suffisant de verdicts pour éviter d'apprendre sur trop peu d'exemples.",
      "Un second axe serait de détecter les modifications substantielles d'une offre lors du re-scraping et de relancer automatiquement son analyse. Aujourd'hui, une offre reste associée à son analyse initiale même si son contenu évolue.",
    ],
  },
};

export default jobAgent;
