# Compte rendu — Séance 3 : MongoDB, Mongoose et asynchronisme

**Cours :** MERN Stack — Séance 3  
**Étudiant :** Safwen Cherif *(nom à confirmer)*  
**Application :** Blog API  
**Date :** 19 octobre 2026

> **État réel du travail :** les étapes de code du TP ont été exécutées et vérifiées avec le MongoDB local. Le `.env` actuel pointe vers `mongodb://127.0.0.1:27017/blog_api`. Atlas n’a pas encore été configuré pour ce projet. Les captures réelles Atlas/Postman restent à prendre ; elles ne sont pas simulées dans ce rapport.

## 1. Réponse à « Prédisez »

Dans les séances 1 et 2, les articles étaient gardés dans un tableau en mémoire. Après dix `POST` puis l’arrêt et le redémarrage du serveur, ces dix articles seraient perdus avec le processus Node.js. Le `GET /api/articles` suivant renverrait uniquement les articles présents dans le tableau initial.

Avec MongoDB, les créations sont enregistrées durablement : le redémarrage du serveur ne les supprime pas. Le même `GET /api/articles` retrouve les documents tant qu’ils n’ont pas été supprimés de la base.

## 2. Configuration et sécurité

Le fichier `.env` local (ignoré par Git) contient les paramètres de développement actuels :

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/blog_api
```

Le MongoDB local fonctionne après application du contournement systemd `GLIBC_TUNABLES=glibc.pthread.rseq=1`; `mongosh` a répondu `{ ok: 1 }` à la commande ping. Le module `dotenv` charge les paramètres au démarrage.

### Configuration Atlas demandée par l’énoncé

1. Créer un projet Atlas et un cluster M0 sur [cloud.mongodb.com](https://cloud.mongodb.com).
2. Dans **Database Access**, créer un utilisateur de base de données doté des droits de lecture/écriture.
3. Dans **Network Access**, autoriser l’adresse IP utilisée pour le laboratoire. L’énoncé propose `0.0.0.0/0` pour le TP ; une seule IP est préférable lorsque c’est possible.
4. Dans **Database → Connect → Drivers → Node.js**, copier l’URI du cluster, puis remplacer `MONGODB_URI` dans `.env` par l’URI Atlas et choisir la base `blogDB`.
5. Encoder les caractères spéciaux du mot de passe dans l’URI. Ne jamais commiter `.env` ni montrer cette URI dans une capture.

Le fichier `.env.example` est un modèle sans identifiants. Pour les captures Atlas demandées par le professeur, le cluster Atlas doit être configuré puis les essais relancés avec cette URI ; les essais effectués localement ne sont pas présentés comme des essais Atlas.

## 3. Architecture et modèles

Le projet possédait déjà les dossiers `controllers/` et `routes/` de la séance 2. Ils sont conservés ; les routeurs n’ont pas changé. La connexion se trouve dans `config/db.js`. Les modèles sont dans `models/`.

- **User :** `name`, `email` (obligatoire, regex, unique, minuscules), `age` (minimum 4, maximum 120), `role` (`user` ou `admin`, par défaut `user`), ainsi que `bio` (maximum 200 caractères) et `phone` (8 chiffres) demandés par l’exercice d’application. `timestamps: true` ajoute `createdAt` et `updatedAt`.
- **Article :** `title`, `content` et `author`. `author` est un ObjectId obligatoire avec `ref: 'User'`, ce qui représente la relation un-à-plusieurs entre un auteur et ses articles.
- Les lectures d’articles utilisent `.populate('author', 'name email')` pour retourner les informations de l’auteur sans les recopier dans chaque article.

Pour créer un article, le client envoie `authorId`; le contrôleur vérifie l’existence de l’utilisateur et enregistre son ObjectId dans `author`.

## 4. Asynchronisme et erreurs

Les requêtes Mongoose utilisent `async/await` et sont protégées par des blocs `try/catch` dans les contrôleurs, comme dans le TP. Les réponses gèrent notamment :

- création valide : `201 Created` ;
- validation Mongoose : `400 Bad Request` ;
- e-mail déjà utilisé : `409 Conflict` ;
- ressource absente : `404 Not Found` ;
- ObjectId mal formé (`CastError`) : `400` et `{ "message": "Identifiant de ressource invalide (format ObjectId attendu)" }`.

Avant la suppression d’un utilisateur, `Article.findOne({ author: req.params.id })` vérifie les dépendances. Si un article existe, la suppression est refusée avec `400` et le message exigé par l’énoncé.

## 5. Démarrage

```bash
npm install
npm run seed   # facultatif dans le TP; prépare les documents d'exemple localement
npm run dev
```

Le serveur ne commence à écouter qu’après la réussite de `connectDB(process.env.MONGODB_URI)`. Le seeder est un utilitaire déjà présent dans ce projet pour préparer les données d’exemple et migrer les anciens articles locaux ; ce n’est pas une étape exigée par le PDF S3.

## 6. Scénario complet à exécuter dans Postman

Importer [`S3_Postman_Collection.json`](S3_Postman_Collection.json). Envoyer les requêtes **une par une dans cet ordre**. Les scripts de collection créent un e-mail unique, puis conservent automatiquement `userId` et `articleId` pour les requêtes suivantes.

| Nº | Méthode et URL | Résultat attendu |
|---:|---|---|
| 01 | `GET http://localhost:3000/api/users` | `200`, tableau d’utilisateurs |
| 02 | `POST http://localhost:3000/api/users` | `201`, utilisateur créé; conserver `_id` |
| 03 | `POST http://localhost:3000/api/users` | `400`, email/âge/rôle/téléphone invalides |
| 04 | `POST http://localhost:3000/api/users` | `409`, même e-mail que la requête 02 |
| 05 | `GET http://localhost:3000/api/users/{{userId}}` | `200` |
| 06 | `GET http://localhost:3000/api/users/abc` | `400`, ObjectId mal formé |
| 07 | `POST http://localhost:3000/api/articles` | `400`, champs requis absents |
| 08 | `POST http://localhost:3000/api/articles` | `404`, auteur valide en forme mais inexistant |
| 09 | `POST http://localhost:3000/api/articles` | `201`, article lié à `{{userId}}`, auteur peuplé |
| 10 | `GET http://localhost:3000/api/articles` | `200`, auteurs peuplés |
| 11 | `GET http://localhost:3000/api/articles/{{articleId}}` | `200` après redémarrage du serveur, preuve de persistance |
| 12 | `PUT http://localhost:3000/api/articles/{{articleId}}` | `200`, article mis à jour et auteur peuplé |
| 13 | `GET http://localhost:3000/api/articles/abc` | `400`, erreur ObjectId demandée dans l’exercice 2 |
| 14 | `GET http://localhost:3000/api/articles/000000000000000000000001` | `404`, ID bien formé mais absent |
| 15 | `DELETE http://localhost:3000/api/users/{{userId}}` | `400`, suppression bloquée par l’article lié |
| 16 | `DELETE http://localhost:3000/api/articles/{{articleId}}` | `200`, suppression de l’article |
| 17 | `DELETE http://localhost:3000/api/users/{{userId}}` | `200`, suppression maintenant permise |

### Corps des requêtes Postman

Choisir `Body → raw → JSON` pour les requêtes `POST` et `PUT`.

**02 — utilisateur valide** (la collection remplace `{{userEmail}}` par une adresse unique) :

```json
{
  "name": "Aya Ben Salah",
  "email": "{{userEmail}}",
  "age": 22,
  "role": "admin",
  "bio": "Étudiante en développement MERN.",
  "phone": "55123456"
}
```

**03 — échec des validations (`400`) :**

```json
{
  "name": "Invalid User",
  "email": "not-an-email",
  "age": 2,
  "role": "author",
  "phone": "123"
}
```

**04 — e-mail dupliqué (`409`) :** renvoyer le corps valide de la requête 02 avec la même variable `{{userEmail}}`.

**07 — champs article manquants (`400`) :**

```json
{
  "title": "Missing content and author"
}
```

**08 — auteur absent de la base (`404`) :**

```json
{
  "title": "Unknown author article",
  "content": "This must not be saved.",
  "authorId": "000000000000000000000001"
}
```

**09 — article lié à l’utilisateur (`201`) :**

```json
{
  "title": "Maîtriser MongoDB Atlas et Mongoose",
  "content": "Mongoose structure les documents et populate reconstitue la relation avec l’auteur.",
  "authorId": "{{userId}}"
}
```

La réponse de création et `GET /api/articles` doivent présenter `author` comme un objet comprenant `name` et `email`, et non comme une chaîne ou un simple ObjectId.

**12 — mise à jour (`200`) :**

```json
{
  "title": "Article Mongoose mis à jour",
  "content": "Le document est mis à jour et son auteur reste peuplé."
}
```

### Vérification de persistance dans Postman

Exécuter les requêtes 01 à 10. Arrêter le serveur avec `Ctrl+C`, puis le relancer avec `npm run dev`. Garder la base et les variables Postman intactes. Envoyer la requête 11 : le même article doit encore être retourné avec son auteur peuplé. Ne pas lancer toute la collection d’un coup pour cette démonstration, car le redémarrage doit avoir lieu entre les requêtes 10 et 11.

## 7. Vérifications réellement effectuées

- `npm run seed` s’est connecté au MongoDB local et a préparé les données ; les anciens articles texte ont été convertis en références d’auteur ObjectId.
- `mongosh` ping a renvoyé `{ ok: 1 }`.
- `GET /api/articles` a renvoyé `200 OK` et une liste où les auteurs sont peuplés.
- `GET /api/articles/abc` et `GET /api/users/abc` ont renvoyé `400` avec le message ObjectId invalide prévu.
- Un test HTTP direct contre l’API locale a validé création d’utilisateur, doublon `409`, création d’article liée avec auteur peuplé, ObjectId invalide `400`, suppression protégée `400`, puis suppression dans l’ordre article/utilisateur (`200`).
- La collection Postman est prête à importer, mais les requêtes et captures GUI Postman/Atlas restent à exécuter par l’étudiant ; aucun résultat Postman ou Atlas n’est inventé.

## 8. Captures réelles à joindre au PDF

Prendre les captures depuis l’interface réelle, masquer les secrets, puis les insérer dans ce rapport avant l’export PDF :

1. Atlas `blogDB.users` avec les utilisateurs enregistrés.
2. Atlas `blogDB.articles` montrant la référence `author`.
3. Postman requête 02 (`201`) avec `_id`.
4. Postman requête 03 (`400`) validation Mongoose.
5. Postman requête 04 (`409`) doublon d’e-mail.
6. Postman requête 09 (`201`) avec auteur peuplé.
7. Postman requête 10 (`200`) liste d’articles avec auteurs peuplés.
8. Postman requête 11 (`200`) après redémarrage du serveur.
9. Postman requête 13 (`400`) sur `/api/articles/abc`.
10. Postman requête 15 (`400`) suppression d’un utilisateur référencé.

## 9. Conclusion

La séance remplace le stockage volatil par MongoDB, applique les règles de validation Mongoose et relie les articles à leurs auteurs par ObjectId. Les opérations asynchrones sont protégées par `try/catch`, `.populate()` restitue les données liées, et les erreurs de validation, de doublon, de dépendance et d’identifiant mal formé reçoivent les statuts attendus.

**À terminer avant le dépôt officiel :** utiliser l’URI Atlas dans `.env`, exécuter les requêtes Postman contre Atlas, prendre les captures demandées et exporter le compte rendu en PDF si la plateforme le requiert.

## Annexe — Code source des modèles et contrôleurs

Les sources complètes sont dans [`models/User.js`](models/User.js), [`models/Article.js`](models/Article.js), [`controllers/userController.js`](controllers/userController.js) et [`controllers/articleController.js`](controllers/articleController.js). Les voici reproduites pour le livrable.

### `models/User.js`

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Format d’email invalide (ex. aya@polytechnique.tn)']
  },
  age: {
    type: Number,
    min: [4, 'L’âge minimum autorisé est de 4 ans'],
    max: [120, 'L’âge maximum autorisé est de 120 ans']
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: '{VALUE} n’est pas un rôle autorisé'
    },
    default: 'user',
    trim: true
  },
  bio: {
    type: String,
    maxlength: [200, 'La biographie ne peut pas dépasser 200 caractères'],
    trim: true
  },
  phone: {
    type: String,
    match: [/^\d{8}$/, 'Numéro de 8 chiffres requis'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

### `models/Article.js`

```js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Le contenu est obligatoire'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L’auteur (authorId) est obligatoire']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Article', articleSchema);
```

### `controllers/userController.js`

```js
const User = require('../models/User');
const Article = require('../models/Article');

const getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (typeof req.query.role === 'string' && req.query.role.trim()) {
      filter.role = req.query.role.trim();
    }
    if (typeof req.query.name === 'string' && req.query.name.trim()) {
      filter.name = req.query.name.trim();
    }

    const users = await User.find(filter);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant de ressource invalide (format ObjectId attendu)'
      });
    }
    res.status(500).json({ message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, age, role, bio, phone } = req.body ?? {};
    if (typeof name !== 'string' || !name.trim() ||
        typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Le nom et l’email sont requis' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      age,
      role,
      bio,
      phone
    });

    res.status(201).json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const dependentArticle = await Article.findOne({ author: user._id }).select('_id');
    if (dependentArticle) {
      return res.status(400).json({
        message: 'Impossible de supprimer un utilisateur ayant des articles publies'
      });
    }

    await User.findByIdAndDelete(user._id);
    res.status(200).json({
      message: 'Utilisateur supprimé avec succès',
      id: user._id
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant de ressource invalide (format ObjectId attendu)'
      });
    }
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser
};
```

### `controllers/articleController.js`

```js
const Article = require('../models/Article');
const User = require('../models/User');

const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate('author', 'name email');
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name email');
    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    res.status(200).json(article);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant de ressource invalide (format ObjectId attendu)'
      });
    }
    res.status(500).json({ message: err.message });
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, content, authorId } = req.body ?? {};
    if (typeof title !== 'string' || !title.trim() ||
        typeof content !== 'string' || !content.trim() || !authorId) {
      return res.status(400).json({
        message: 'title, content et authorId sont obligatoires'
      });
    }

    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({
        message: 'Auteur non trouvé (identifiant authorId invalide)'
      });
    }

    const article = await Article.create({
      title: title.trim(),
      content: content.trim(),
      author: authorId
    });
    const populatedArticle = await article.populate('author', 'name email');
    res.status(201).json(populatedArticle);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant de ressource invalide (format ObjectId attendu)'
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { title, content, authorId } = req.body ?? {};
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (authorId !== undefined) {
      const author = await User.findById(authorId);
      if (!author) {
        return res.status(404).json({
          message: 'Auteur non trouvé (identifiant authorId invalide)'
        });
      }
      updates.author = author._id;
    }

    const article = await Article.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('author', 'name email');

    if (!article) {
      return res.status(404).json({
        message: 'Article introuvable pour la mise à jour'
      });
    }

    res.status(200).json(article);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant de ressource invalide (format ObjectId attendu)'
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({
        message: 'Article introuvable pour la suppression'
      });
    }

    res.status(200).json({
      message: 'Article supprimé avec succès',
      id: req.params.id
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant de ressource invalide (format ObjectId attendu)'
      });
    }
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllArticles,
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle
};
```
