# Graphics Lab

Prototype front-only pour tester une logique de creation, verification et export de graphiques inspiree du projet Q, mais dans une forme beaucoup plus legere.

## Ce que fait ce prototype

- edition locale d'un graphique simple
- saisie directe des donnees dans un tableau
- import CSV pour remplir rapidement le tableau
- configuration de series multiples
- templates proches du rapport annuel pour colonnes empilees et colonnes positives / negatives
- graphiques en barres horizontales, verticales et courbe
- checks de base orientes institutionnels
- preview immediate
- export SVG
- export PNG calibre pour une page Word A4 standard
- sauvegarde locale de projets avec historique de versions dans le navigateur
- palette visuelle alignee sur des couleurs relevees sur efk.admin.ch

## Ce que ce prototype ne fait pas encore

- pas de backend
- pas d'authentification
- pas de workflow multi-utilisateur
- pas de publication vers un CMS
- pas de base de donnees

## Demarrage

Le prototype est statique. Deux options simples:

1. Ouvrir `index.html` dans un navigateur.
2. Lancer un petit serveur local, par exemple:

```bash
python3 -m http.server 4173
```

Puis ouvrir [http://localhost:4173](http://localhost:4173).

## Structure

- `index.html`: interface
- `styles.css`: design et layout
- `app.js`: logique de formulaire, checks, rendu SVG, export

## Sauvegarde locale

- Le bouton `Sauver une version` cree une nouvelle version du projet dans `localStorage`.
- La zone `Projet` affiche les projets sauves dans ce navigateur et permet de recharger la derniere version ou une version precise.
- Chaque version peut aussi etre supprimee individuellement depuis l'historique.
- Le bouton `Nouveau depuis l'actuel` permet de repartir du travail en cours pour creer un autre projet, sans ecraser le projet charge.
- Le brouillon en cours est aussi retenu automatiquement dans la session locale du navigateur.

## Export Word

- Le bouton `Exporter en PNG Word` genere un PNG calibre pour la largeur utile d'une page Word A4 standard.
- L'objectif est de pouvoir coller l'image dans Word sans redimensionnement manuel.
- L'export SVG utilise aussi une largeur physique calibree pour ce meme usage.

## Idee d'evolution

1. Ajouter d'autres templates comme timeline ou matrice de recommandations.
2. Brancher un backend simple pour stocker les brouillons.
3. Ajouter un vrai workflow `draft / review / approved / published`.
4. Publier une version de demonstration via GitHub Pages.
