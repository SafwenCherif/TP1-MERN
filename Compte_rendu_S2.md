# Compte rendu - Session 2

## Structuration de l'API et architecture SoC

Cette session a consisté à modulariser les domaines `articles` et `users` dans une API Express. La logique métier a été séparée de la configuration globale du serveur grâce à des contrôleurs et des routeurs dédiés.

## 1. Objectifs

- Séparer les données et la logique métier des articles de `server.js`.
- Créer un routeur Express dédié aux articles.
- Compléter le CRUD des articles avec `PUT` et `DELETE`.
- Modulariser ensuite le domaine des utilisateurs sans modifier le domaine des articles.
- Vérifier le comportement de l'API avec des tests automatisés.

## 2. Architecture obtenue

```text
server.js
  |
  |-- /api/articles --> routes/articleRoutes.js
  |                         |
  |                         `--> controllers/articleController.js
  |
  `-- /api/users -----> routes/userRoutes.js
                            |
                            `--> controllers/userController.js
```

`server.js` conserve la configuration globale :

- création de l'application Express ;
- middleware `express.json()` ;
- routes globales `/` et `/about` ;
- montage des routeurs ;
- route `/contact` ;
- démarrage du serveur.

Les contrôleurs contiennent les tableaux en mémoire et les traitements associés. Les routeurs associent les méthodes HTTP aux fonctions des contrôleurs.

## 3. Domaine articles

### 3.1 Contrôleur

Le fichier [controllers/articleController.js](controllers/articleController.js) contient les données initiales :

```js
[
  { id: 1, title: 'Welcome to the blog', author: 'Admin' },
  { id: 2, title: 'My first Express server', author: 'Aya' },
  { id: 3, title: 'Testing an API with Postman', author: 'Aya' }
]
```

L'identifiant suivant commence à `4` et est incrémenté à chaque création.

Les fonctions exportées avec CommonJS sont :

- `getAllArticles` : récupère tous les articles et accepte le filtre facultatif `?author=...` ;
- `getArticleById` : recherche un article par identifiant ;
- `createArticle` : vérifie la présence de `title` et `author`, puis crée un article ;
- `updateArticle` : modifie le titre et/ou l'auteur d'un article existant ;
- `deleteArticle` : supprime un article existant.

Exemple d'export :

```js
module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
```

### 3.2 Routeur

Le fichier [routes/articleRoutes.js](routes/articleRoutes.js) utilise `express.Router()` et définit les routes relatives à la ressource :

| Méthode | Chemin final | Fonction | Résultat principal |
|---|---|---|---|
| `GET` | `/api/articles` | `getAllArticles` | Liste des articles et total |
| `GET` | `/api/articles/:id` | `getArticleById` | Article demandé ou `404` |
| `POST` | `/api/articles` | `createArticle` | Article créé avec `201` |
| `PUT` | `/api/articles/:id` | `updateArticle` | Article mis à jour avec `200` |
| `DELETE` | `/api/articles/:id` | `deleteArticle` | Article supprimé avec `200` |

Le préfixe `/api/articles` est défini une seule fois dans `server.js` :

```js
app.use('/api/articles', articleRoutes);
```

## 4. Domaine users

### 4.1 Contrôleur

Le fichier [controllers/userController.js](controllers/userController.js) contient deux utilisateurs fictifs :

```js
[
  { id: 1, name: 'Aya', email: 'aya@example.com', role: 'author' },
  { id: 2, name: 'Admin', email: 'admin@example.com', role: 'admin' }
]
```

L'identifiant suivant commence à `3`.

Les fonctions exportées sont :

- `getAllUsers` : récupère tous les utilisateurs et accepte le filtre facultatif `?role=...` ;
- `getUserById` : recherche un utilisateur par identifiant et renvoie `404` s'il n'existe pas ;
- `createUser` : valide obligatoirement `name` et `email`, puis crée un utilisateur avec le statut `201` ;
- `deleteUser` : supprime un utilisateur ou renvoie `404` si l'identifiant est inconnu.

Le champ `role` est facultatif à la création. Lorsqu'il n'est pas fourni, la valeur par défaut est `user`.

### 4.2 Routeur

Le fichier [routes/userRoutes.js](routes/userRoutes.js) associe les routes suivantes :

| Méthode | Chemin final | Fonction | Résultat principal |
|---|---|---|---|
| `GET` | `/api/users` | `getAllUsers` | Liste des utilisateurs |
| `GET` | `/api/users?role=author` | `getAllUsers` | Utilisateurs filtrés par rôle |
| `GET` | `/api/users/:id` | `getUserById` | Utilisateur demandé ou `404` |
| `POST` | `/api/users` | `createUser` | Utilisateur créé avec `201` |
| `DELETE` | `/api/users/:id` | `deleteUser` | Utilisateur supprimé avec `200` |

Le routeur est monté dans [server.js](server.js) :

```js
app.use('/api/users', userRoutes);
```

Le domaine users a été ajouté sans modifier le contrôleur ou le routeur des articles.

## 5. Module utilitaire de validation

Le fichier [utils/validators.js](utils/validators.js) centralise les validations réutilisables afin d'éviter de dupliquer les conditions dans les contrôleurs.

Il exporte deux fonctions CommonJS :

- `estNonVide(chaine)` vérifie que la valeur est une chaîne contenant au moins un caractère non blanc ;
- `estEmailValide(email)` vérifie que la valeur contient `@` et `.`.

Le contrôleur [controllers/userController.js](controllers/userController.js) importe ces fonctions :

```js
const { estNonVide, estEmailValide } = require('../utils/validators');
```

Dans `createUser` :

- un nom absent ou vide renvoie `400 Bad Request` avec `Name is required and cannot be empty` ;
- un email absent ou ne contenant pas `@` et `.` renvoie `400 Bad Request` avec `Email must be valid and contain @ and .`.

Cette séparation rend les règles de validation réutilisables par d'autres contrôleurs.

## 6. Exemples de requêtes

### Articles

```http
GET http://localhost:3000/api/articles
GET http://localhost:3000/api/articles?author=Aya
GET http://localhost:3000/api/articles/2
```

Création :

```http
POST http://localhost:3000/api/articles
Content-Type: application/json
```

```json
{
  "title": "Nouvel article",
  "author": "Aya"
}
```

Modification :

```http
PUT http://localhost:3000/api/articles/2
Content-Type: application/json
```

```json
{
  "title": "Express et Architecture SoC Maitrises"
}
```

Suppression :

```http
DELETE http://localhost:3000/api/articles/1
```

### Utilisateurs

```http
GET http://localhost:3000/api/users
GET http://localhost:3000/api/users?role=author
GET http://localhost:3000/api/users/1
```

Création :

```http
POST http://localhost:3000/api/users
Content-Type: application/json
```

```json
{
  "name": "Alex",
  "email": "alex@example.com",
  "role": "reader"
}
```

Suppression :

```http
DELETE http://localhost:3000/api/users/3
```

## 7. Validation et tests

Les tests sont définis dans [test/server.test.js](test/server.test.js). Ils couvrent :

- la route d'accueil et `/about` ;
- la liste, le filtre et la recherche par identifiant des articles ;
- la validation et la création d'un article ;
- la liste, le filtre par rôle et la recherche par identifiant des utilisateurs ;
- la validation, la création et la suppression d'un utilisateur ;
- la route `/contact`.

Commande exécutée :

```bash
npm test
```

Résultat obtenu :

```text
7 tests
7 pass
0 fail
```

Un smoke test supplémentaire a confirmé les opérations `PUT` et `DELETE` des articles, notamment le retour `404` lorsqu'une ressource déjà supprimée est ciblée une seconde fois.

## 8. Limites actuelles

Les articles et les utilisateurs sont stockés uniquement dans des tableaux en mémoire. Les données créées, modifiées ou supprimées sont donc perdues lorsque le serveur est redémarré. Une prochaine étape pourra consister à connecter ces contrôleurs à une base de données MongoDB.

## Conclusion

L'API est maintenant organisée selon une architecture Separation of Concerns. `server.js` orchestre l'application, les routeurs gèrent l'aiguillage HTTP et les contrôleurs contiennent la logique métier de chaque domaine. Les domaines `articles` et `users` sont indépendants, testables et prêts à évoluer séparément.