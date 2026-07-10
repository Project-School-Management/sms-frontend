# KalanBlonw — Frontend (sms-frontend)

Application web du système de gestion scolaire **KalanBlonw** (School Management
System). Monorepo **Nx** contenant l'application Angular 18 `sms-web` et ses
bibliothèques métier organisées par domaine.

> Déployée en production : **https://kalanblonw.y3na.com**

---

## Stack technique

| Domaine | Technologie |
|---|---|
| Framework | **Angular 18.2** — composants **standalone**, routing **lazy**, `OnPush` |
| Monorepo | **Nx 19.8** |
| State management | **NgRx Signal Store** (`@ngrx/signals` 18.1) + **signals** natifs — PAS de NgRx classique |
| UI | **Angular Material 18.2** + **Tailwind CSS 3.4** |
| Auth | **keycloak-angular 16** + **keycloak-js 24** — OIDC/PKCE S256 |
| WebSocket | **@stomp/stompjs 7** + **sockjs-client** (messagerie temps réel) |
| Langage | **TypeScript 5.4** (strict) |
| Tests | **Jest 29** (unitaires) + **Playwright 1.45** (e2e) |
| PWA | `@angular/service-worker` |
| Runtime | **Node.js 22** (voir `.nvmrc`) |

---

## Architecture Nx

```
apps/
  sms-web/        → application principale (port 4200)
  sms-web-e2e/    → tests end-to-end Playwright

libs/
  {domaine}/
    data-access/  → stores (Signal Store), services API, mocks
    feature/      → pages & composants routés
    ui/           → composants de présentation réutilisables
```

**Alias de chemins** : `@sms/{domaine}/{couche}` (définis dans `tsconfig.base.json`).

### Domaines métier

`academic` · `analytics` · `communication` · `config-system` · `core` ·
`dashboard` · `finance` · `layouts` · `learning` · `library` · `schedule` ·
`shared` · `students` · `users`

### Signal Stores

`AcademicStore` · `AbsencesStore` · `AnalyticsStore` · `AuthStore` ·
`CommunicationStore` · `DashboardStore` · `FinanceStore` · `LearningStore` ·
`LibraryStore` · `ScheduleStore` · `StudentsStore` · `UsersStore` ·
`ReferenceStore`

---

## Démarrage

```bash
# Node 22 (via nvm)
nvm use

# Installer les dépendances
npm install --legacy-peer-deps

# Lancer le serveur de dev (http://localhost:4200)
npm start
```

### Scripts npm

| Script | Description |
|---|---|
| `npm start` | Serveur de dev (`nx serve sms-web`) |
| `npm run build` | Build de développement |
| `npm run build:prod` | Build de production |
| `npm test` | Tests unitaires (tous les projets) |
| `npm run test:affected` | Tests unitaires des projets impactés (vs `main`) |
| `npm run lint` | Lint de tous les projets |
| `npm run e2e` | Tests end-to-end Playwright |
| `npm run graph` | Graphe de dépendances Nx |

---

## État des données — mocks réalistes

Les stores fonctionnent actuellement sur des **données mockées réalistes**
(pas encore branchées sur les APIs backend réelles). Ces mocks doivent rester
**alignés sur les contrats API** documentés dans
[`../docs/api-contracts/`](../docs/api-contracts/) — un mock qui diverge du
contrat réel est un bug.

L'authentification, elle, est câblée sur le **Keycloak réel** dès le
développement (`skipKeycloak: false`) :

| Paramètre | Valeur (prod) |
|---|---|
| Keycloak URL | `https://auth.y3na.com` |
| Realm | `sms` |
| Client | `sms-web` (public, PKCE S256) |
| API base URL | `https://api.y3na.com/api` |

Configuration dans `apps/sms-web/src/environments/`.

---

## Conventions de code

**Structure d'un composant — 3 fichiers séparés (obligatoire)** :

```
xxx.component.ts    → classe/logique uniquement (templateUrl + styleUrl)
xxx.component.html  → template
xxx.component.scss  → styles spécifiques (Tailwind + variables CSS var(--...))
```

- Composants **standalone** + `ChangeDetectionStrategy.OnPush` — jamais de NgModule
- État local & dérivé via **signals** (`signal`, `computed`, `input`, `model`)
- État partagé via **Signal Store** (`signalStore`, `withState/withComputed/withMethods`, `rxMethod`) — pas de `subscribe` manuel
- Styles : Tailwind + variables CSS de thème (`var(--text-primary)`, `var(--accent)`, `var(--surface-2)`…) pour le support clair/sombre
- UI en français

---

## Déploiement

Le frontend est conteneurisé (build multi-stage Node 22 → nginx) et déployé via
**Coolify** depuis GitHub.

- `Dockerfile` — build Nx production puis service statique nginx
- `nginx.conf` — routing SPA (`try_files … /index.html`), gzip, cache des assets

CI : `.github/workflows/ci.yml` (build + tests unitaires sur push/PR vers `main`).

---

## Structure du dépôt

Ce dépôt fait partie du projet multi-repo **KalanBlonw**
(organisation GitHub `Project-School-Management`). Chaque microservice backend
et le frontend sont des dépôts Git indépendants. Voir `CLAUDE.md` à la racine du
workspace pour l'architecture globale.
