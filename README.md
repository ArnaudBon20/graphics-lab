# CDF Graphics Lab

Prototype front-only pour tester une logique de creation, verification et export de graphiques inspiree du projet Q, mais dans une forme beaucoup plus legere.

## Ce que fait ce prototype

- edition locale d'un graphique simple
- collage ou import manuel de donnees CSV
- checks de base orientes institutionnels
- preview immediate
- export SVG
- sauvegarde locale dans le navigateur

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

## Idee d'evolution

1. Ajouter d'autres templates comme timeline ou matrice de recommandations.
2. Brancher un backend simple pour stocker les brouillons.
3. Ajouter un vrai workflow `draft / review / approved / published`.
4. Publier une version de demonstration via GitHub Pages.
