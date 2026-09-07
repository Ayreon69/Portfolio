# Polices de build — jamais servies au visiteur

Ces deux fichiers sont lus par `fs.readFileSync` **au moment du build**, par les routes
`opengraph-image` (`app/opengraph-image.tsx` et
`app/laboratoire/[slug]/opengraph-image.tsx`).

`ImageResponse` exige le binaire de la police : sans lui, Satori remplace Bodoni par une
sans-serif par défaut et la carte de partage perd l'identité du site.

## Pourquoi ici et pas dans `public/`

`public/` est servi au navigateur. Ces fichiers ne doivent l'être à aucun moment — le
site charge déjà ses polices via `next/font/google` (`app/layout.tsx`), et les servir une
seconde fois serait un doublon payé par le visiteur. **Coût client de ce dossier : zéro
octet.**

## Pourquoi versionnées et pas téléchargées au build

Même principe que **D-17** : les instantanés de `public/univers/` sont produits une fois
et versionnés, jamais reconstruits au build. Un build ne doit pas dépendre du réseau.

## Ce que c'est exactement

| Fichier | Famille | Graisse | Provenance |
|---|---|---|---|
| `BodoniModa-Bold.ttf` | Bodoni Moda | 700 | Google Fonts, sous-ensemble latin |
| `IBMPlexMono-Regular.ttf` | IBM Plex Mono | 400 | Google Fonts, sous-ensemble latin |

Ce sont des **instances statiques**, pas les fichiers variables : Satori gère mal les
axes variables et rendrait une graisse 400 là où 700 est demandé. Vérifié à la
récupération (aucune table `fvar`).

Mêmes familles et mêmes graisses que `app/layout.tsx` (§03.4, D-06) : la carte de
partage et la page affichent la même typographie.

## Licence

Les deux familles sont sous **SIL Open Font License 1.1**, qui exige que la licence
accompagne les fichiers — c'est `OFL.txt`, dans ce dossier.

- Bodoni Moda — Copyright 2020 The Bodoni Moda Project Authors
- IBM Plex Mono — Copyright © 2017 IBM Corp., Reserved Font Name « Plex »
