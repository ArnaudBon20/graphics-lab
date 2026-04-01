# Mini POC Docker "like Q"

Ce dossier est **separe** du projet principal et sert uniquement a apprendre l'architecture:

- `CouchDB` pour stocker les items
- `q-server` (mini implementation compatible Q-editor)
- `tool-basic` (1 outil de rendu)
- `Q-editor` (image officielle `nzzonline/q-editor`)

## Demarrage rapide

1. Installer Docker Desktop (ou Docker Engine + Compose).
2. Ouvrir un terminal dans ce dossier:
   - `cd /Users/arnaudbonvin/Documents/Windsurf/graphics-lab/q-poc-docker`
3. Lancer la stack:
   - `docker compose up --build`
4. Ouvrir:
   - Q-editor: [http://localhost:8080](http://localhost:8080)
   - q-server health: [http://localhost:3001/health](http://localhost:3001/health)
   - tool health: [http://localhost:4000/health](http://localhost:4000/health)
   - CouchDB: [http://localhost:5984/_utils](http://localhost:5984/_utils)
5. Login dans Q-editor:
   - n'importe quel username/password (POC)

## Architecture (POC)

- `Q-editor` parle au `q-server`.
- `q-server` stocke/charge les items dans `CouchDB`.
- `q-server` demande au `tool-basic`:
  - `schema.json` pour l'editeur
  - `rendering-info` pour le preview.

Flux simplifie:

1. Login via `/authenticate`.
2. Chargement config via `/editor/config`, `/editor/tools`, `/editor/targets`.
3. Liste des items via `/search`.
4. Edition d'un item via `/tools/simple-bars/schema.json`.
5. Preview via `/rendering-info/...` -> proxy vers `tool-basic`.

## Endpoints principaux du mini q-server

- Auth/session: `/authenticate`, `/logout`, `/user`
- Config editor: `/editor/config`, `/editor/tools`, `/editor/targets`
- Items: `/item`, `/item/:id`, `/search`
- Stats: `/statistics/number-of-items`
- Preview: `/rendering-info/:id/:target`, `/rendering-info/:target`
- Tool proxy: `/tools/simple-bars/schema.json`

## Notes importantes

- C'est un **POC pedagogique**, pas une stack de production.
- Le `q-server` ici est une implementation "light" (pas le package NZZ complet avec Hapi/plugins/migrations/auth avancee).
- Les sessions sont en memoire (redemarrage = session perdue).
- Un item d'exemple est cree automatiquement au premier lancement.

## Arret / reset

- Arreter:
  - `docker compose down`
- Arreter + supprimer les donnees CouchDB:
  - `docker compose down -v`
