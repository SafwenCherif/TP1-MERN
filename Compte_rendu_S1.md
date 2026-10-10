# Compte rendu — Session 1 : My First Express Server




**Démarrage et vérification :**

```bash
npm install
npm run dev
```

Le serveur écoute par défaut sur `http://localhost:3000`. Un autre port peut être choisi avec la variable d’environnement `PORT`. Les exercices JavaScript et les tests s’exécutent avec :

```bash
node exercices_js.js
npm test
```

**Environnement observé :** Node.js `v24.16.0`, npm `11.13.0`, Express `5.2.1` (version déclarée dans `package.json`).

## 2. Prédictions et résultats

### 2.1 Type du paramètre `id`

**Prédiction :** Dans `/api/articles/2`, la valeur extraite par `req.params.id` est la chaîne de caractères `"2"`, et non le nombre `2`. En conséquence, `"2" === 2` vaut `false`.

**Résultat :** Le paramètre de route est une chaîne. La conversion `Number(req.params.id)` est nécessaire avant de le comparer aux identifiants numériques stockés dans les objets. La route convertit la valeur et retrouve correctement l’article 2.

### 2.2 Filtrage des articles — étape 5

| Requête | Prédiction : valeur de `total` | Résultat vérifié |
|---|---:|---:|
| `GET /api/articles` | 3 | 3 articles |
| `GET /api/articles?author=Aya` | 2 | 2 articles |
| `GET /api/articles?author=Omar` | 0 | 0 article |

Les résultats correspondent aux données initiales. La route renvoie un tableau vide, et non une erreur, lorsqu’aucun article ne correspond au filtre.

### 2.3 Prédiction des statuts — étape 7

| Requête | Statut prédit | Résultat vérifié | Explication |
|---|---:|---:|---|
| `GET /api/articles` | `200 OK` | `200 OK` | La collection est renvoyée. |
| `POST /api/articles` avec titre et auteur | `201 Created` | `201 Created` | Une nouvelle ressource est créée. |
| `GET /api/articles/4` après la création | `200 OK` | `200 OK` | L’article créé est retrouvé. |
| `POST /api/articles` sans auteur | `400 Bad Request` | `400 Bad Request` | Le corps ne satisfait pas la validation. |
| `GET /api/articles/99` | `404 Not Found` | `404 Not Found` | Aucun article ne porte cet identifiant. |

Les statuts sont conformes aux prédictions. La suite de tests automatise ces cas ; elle exécute les créations dans un processus temporaire de test. Au redémarrage normal du serveur, les articles reviennent à leur état initial (trois articles), puisque le stockage est uniquement en mémoire.

## 3. Exercice 1 — Extension de l’API

### 3.1 `GET /about`

Retourne le nom de l’application, le nom d’étudiant configuré et la version :

```json
{
  "application": "Blog API",
  "student": "Safwen Cherif",
  "version": "1.0.0"
}
```

Le nom peut être remplacé sans modifier le code en définissant `STUDENT_NAME` avant le lancement du serveur. La valeur par défaut est `Safwen Cherif` et doit être vérifiée par l’étudiant.

### 3.2 `GET /api/users` et filtre facultatif

Sans paramètre, la route renvoie trois utilisateurs : Aya, Admin et Alex, chacun avec un identifiant, un nom et une adresse électronique. Le bonus `GET /api/users?name=Aya` renvoie uniquement Aya.

### 3.3 `GET /api/users/:id`

`GET /api/users/1` renvoie l’utilisateur Aya avec le statut `200`. Un identifiant inconnu, par exemple `/api/users/99`, renvoie un objet d’erreur JSON et le statut `404`.

### 3.4 `POST /contact`

Le corps doit être envoyé au format JSON et contenir des champs `email` et `message` non vides.

**Succès — statut `200` :**

```json
{
  "message": "Thank you, your message has been received"
}
```

**Champ manquant ou vide — statut `400` :**

```json
{
  "error": "Email and message are required"
}
```

### 3.5 Exemples de vérification HTTP

```http
GET http://localhost:3000/about
GET http://localhost:3000/api/users
GET http://localhost:3000/api/users?name=Aya
GET http://localhost:3000/api/users/1
GET http://localhost:3000/api/users/99
```

Pour les requêtes POST, choisir `Body` → `raw` → `JSON` dans Postman et envoyer :

```json
{
  "email": "person@example.com",
  "message": "Bonjour, ceci est un message de test."
}
```

Pour le cas d’erreur, retirer `message` du corps. La suite de tests vérifie les codes, les contenus et les cas de succès/erreur des routes.

## 4. Exercice 2 — Idiomes JavaScript

Le fichier `exercices_js.js` applique la décomposition d’objet, `find`, `filter` et une fonction fléchée avec réduction de 10 %.

```js
const products = [
  { name: 'Keyboard', price: 45 },
  { name: 'Monitor', price: 320 },
  { name: 'Mouse', price: 25 }
];

const { name, price } = products[0];
console.log(name, price);

const mouse = products.find(product => product.name === 'Mouse');
console.log(mouse.price);

const affordableProducts = products.filter(product => product.price < 100);
console.log(affordableProducts);

const withDiscount = price => price * 0.9;
console.log(withDiscount(320));
```

**Sortie réelle de `node exercices_js.js` :**

```text
Keyboard 45
25
[ { name: 'Keyboard', price: 45 }, { name: 'Mouse', price: 25 } ]
288
```

La sortie correspond au résultat attendu : les produits sous 100 sont le clavier et la souris, et le prix de 320 après une réduction de 10 % est 288.

## 5. Essais Postman et captures à joindre

Les tests HTTP ont été exécutés automatiquement avec `npm test` (voir section 6). Comme aucune capture Postman n’a été produite pendant ces essais, les éléments ci-dessous sont des emplacements à remplacer par les captures réelles si le dépôt final PDF les exige — ils ne représentent pas des captures déjà réalisées.

| Capture à insérer | Requête et résultat à montrer | Légende proposée |
|---|---|---|
| Capture 1 | `GET /about` — `200 OK` | L’endpoint `/about` expose le nom de l’application, l’étudiant et la version. |
| Capture 2 | `GET /api/users` — `200 OK`, trois utilisateurs | La collection des utilisateurs est renvoyée sous forme de tableau JSON. |
| Capture 3 | `GET /api/users?name=Aya` — `200 OK`, utilisateur filtré | Le paramètre de requête `name` filtre la collection sur le nom demandé. |
| Capture 4 | `GET /api/users/1` — `200 OK` | L’identifiant 1 permet de récupérer l’utilisateur Aya. |
| Capture 5 | `GET /api/users/99` — `404 Not Found` | Un identifiant inconnu provoque une réponse d’erreur explicite. |
| Capture 6 | `POST /contact` avec les deux champs — `200 OK` | Un message de contact complet est accepté par l’API. |
| Capture 7 | `POST /contact` sans `message` — `400 Bad Request` | La validation refuse le message lorsque le champ obligatoire est absent. |

Dans chaque capture Postman, faire apparaître la méthode, l’URL, le corps JSON pour les requêtes POST, le statut HTTP et le corps de réponse.

## 6. Vérifications et conclusion

La commande `npm test` a réussi : **6 tests passés, 0 échec**. Les tests vérifient la route d’accueil, les métadonnées, la liste et le filtre des articles, la recherche par identifiant, la création et sa validation, les utilisateurs, ainsi que les cas de succès et d’erreur de `/contact`.

La commande `node exercices_js.js` a produit la sortie attendue. Le script `npm run dev` lance désormais correctement `node --watch server.js`.

Cette séance montre comment Express associe méthode HTTP et URL à un gestionnaire, comment lire `req.params`, `req.query` et `req.body`, et comment renvoyer un JSON accompagné du statut HTTP adapté. Elle met également en évidence la différence entre `find` (un seul élément), `filter` (tous les éléments correspondants) et le stockage persistant : les tableaux en mémoire sont réinitialisés au redémarrage.

## 7. Code source complet

Les fichiers du projet sont également disponibles directement dans l’espace de travail : [`server.js`](server.js), [`exercices_js.js`](exercices_js.js), [`test/server.test.js`](test/server.test.js) et [`package.json`](package.json). Le code complet du serveur est reproduit ci-dessous afin que ce compte rendu contienne le code demandé dans le livrable.

### Annexe A — `server.js`

```js
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const STUDENT_NAME = process.env.STUDENT_NAME || 'Safwen Cherif';

app.use(express.json());

const articles = [
  { id: 1, title: 'Welcome to the blog', author: 'Admin' },
  { id: 2, title: 'My first Express server', author: 'Aya' },
  { id: 3, title: 'Testing an API with Postman', author: 'Aya' }
];

const users = [
  { id: 1, name: 'Aya', email: 'aya@example.com' },
  { id: 2, name: 'Admin', email: 'admin@example.com' },
  { id: 3, name: 'Alex', email: 'alex@example.com' }
];

let nextArticleId = 4;

app.get('/', (req, res) => {
  res.json({ message: 'Hello, I am the blog API' });
});

app.get('/about', (req, res) => {
  res.json({
    application: 'Blog API',
    student: STUDENT_NAME,
    version: '1.0.0'
  });
});

app.get('/api/articles', (req, res) => {
  const { author } = req.query;
  const result = author
    ? articles.filter(article => article.author === author)
    : articles;

  res.json({ total: result.length, articles: result });
});

app.get('/api/articles/:id', (req, res) => {
  const id = Number(req.params.id);
  const article = articles.find(item => item.id === id);

  if (!article) {
    return res.status(404).json({
      error: `Article ${req.params.id} not found`
    });
  }

  res.json(article);
});

app.post('/api/articles', (req, res) => {
  const { title, author } = req.body ?? {};

  if (typeof title !== 'string' || !title.trim() ||
      typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({
      error: 'Title and author are required'
    });
  }

  const newArticle = {
    id: nextArticleId,
    title: title.trim(),
    author: author.trim()
  };

  nextArticleId += 1;
  articles.push(newArticle);

  res.status(201).json({
    message: 'Article created',
    article: newArticle
  });
});

app.get('/api/users', (req, res) => {
  const { name } = req.query;
  const result = name
    ? users.filter(user => user.name === name)
    : users;

  res.json(result);
});

app.get('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(item => item.id === id);

  if (!user) {
    return res.status(404).json({
      error: `User ${req.params.id} not found`
    });
  }

  res.json(user);
});

app.post('/contact', (req, res) => {
  const { email, message } = req.body ?? {};

  if (typeof email !== 'string' || !email.trim() ||
      typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      error: 'Email and message are required'
    });
  }

  res.status(200).json({
    message: 'Thank you, your message has been received'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
```
