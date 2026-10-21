# Blog API: Lab 3 (MongoDB, Mongoose and async/await)

This README summarizes [`Compte_rendu_S3.md`](Compte_rendu_S3.md), the Lab 3 report. The lab moves the API from in-memory arrays to MongoDB through Mongoose.

> **Note:** the code in this repository has since been upgraded for Lab 4 (JWT authentication). Article write routes now require a token and no longer accept `authorId`, so the Lab 3 Postman requests below only work against the Lab 3 version of the code. The Lab 3 code is reproduced in the annex of the report.

## What was done in Lab 3

- **Persistence:** users and articles are stored in MongoDB instead of JavaScript arrays, so data survives a server restart.
- **Connection:** `config/db.js` opens the connection from `MONGODB_URI`, loaded from `.env` with `dotenv`. `server.js` only starts listening once the connection succeeds. `.env` is git-ignored and `.env.example` is a credential-free template.
- **User schema** (`models/User.js`):
  - `name` is required.
  - `email` is required, unique, lowercase and checked by a regex.
  - `age` must be between 4 and 120.
  - `role` is `user` or `admin`, defaulting to `user`.
  - `bio` has a maximum of 200 characters and `phone` must be 8 digits (exercise 1).
  - `timestamps: true` adds `createdAt` and `updatedAt`.
- **Article schema** (`models/Article.js`): `title`, `content` and `author`. `author` is an ObjectId with `ref: 'User'`, a one-to-many relation (one user, many articles).
- **Population:** article reads use `.populate('author', 'name email')`, so the author appears as an object instead of an id.
- **Async controllers:** every operation uses `async/await` inside `try/catch`.
- **Error handling:**

  | Case | Status |
  |---|---|
  | Created | `201` |
  | Mongoose validation error | `400` |
  | Duplicate email | `409` |
  | Resource not found | `404` |
  | Malformed ObjectId (`CastError`, exercise 2) | `400` with `Identifiant de ressource invalide (format ObjectId attendu)` |

- **Referential integrity** (exercise 1): `DELETE /api/users/:id` returns `400` ("Impossible de supprimer un utilisateur ayant des articles publies") if the user still has articles.

## Setup

```bash
npm install
npm run dev
```

`.env` needs a `MONGODB_URI`. The current setup uses local MongoDB (`mongodb://127.0.0.1:27017/blog_api`). The lab asks for MongoDB Atlas, where you put your Atlas URI in `.env` instead, keeping the database name `blogDB`.

`npm run seed` is an optional script that inserts sample users and articles. It is not part of the lab.

## Testing in Postman

Import [`S3_Postman_Collection.json`](S3_Postman_Collection.json). It has 17 numbered requests with status assertions, and the base URL is `http://localhost:3000`. Send them **one by one, in order**. The collection generates a unique email and stores `userId` and `articleId` automatically.

For `POST` and `PUT` requests, use **Body → raw → JSON**.

| # | Request | Expected |
|--:|---|---|
| 01 | `GET /api/users` | `200`, array of users |
| 02 | `POST /api/users` (valid user) | `201`, copy the `_id` |
| 03 | `POST /api/users` (bad email, `age: 2`, bad role and phone) | `400` |
| 04 | `POST /api/users` (same email as 02) | `409` |
| 05 | `GET /api/users/{{userId}}` | `200` |
| 06 | `GET /api/users/abc` | `400` (CastError) |
| 07 | `POST /api/articles` (title only) | `400` |
| 08 | `POST /api/articles` (unknown `authorId`) | `404` |
| 09 | `POST /api/articles` (linked to `{{userId}}`) | `201`, `author` is populated |
| 10 | `GET /api/articles` | `200`, authors populated |
| 11 | `GET /api/articles/{{articleId}}` | `200` after a restart (persistence proof) |
| 12 | `PUT /api/articles/{{articleId}}` | `200`, author still populated |
| 13 | `GET /api/articles/abc` | `400` (CastError) |
| 14 | `GET /api/articles/000000000000000000000001` | `404` |
| 15 | `DELETE /api/users/{{userId}}` | `400`, user still has an article |
| 16 | `DELETE /api/articles/{{articleId}}` | `200` |
| 17 | `DELETE /api/users/{{userId}}` | `200` |

Example body for request 02:

```json
{
  "name": "Aya Ben Salah",
  "email": "aya@polytechnique.tn",
  "age": 22,
  "role": "admin",
  "bio": "Étudiante en développement MERN.",
  "phone": "55123456"
}
```

Example body for request 09:

```json
{
  "title": "Maîtriser MongoDB Atlas et Mongoose",
  "content": "Mongoose structure les documents et populate reconstitue la relation avec l'auteur.",
  "authorId": "<paste the user _id here>"
}
```

**Persistence check:** run requests 01 to 10, stop the server with `Ctrl+C`, restart it with `npm run dev`, then send request 11. The same article should still come back with its author populated.

## Still to do for the Lab 3 submission

- Configure Atlas and point `.env` at it.
- Run the requests in Postman against Atlas.
- Take the Atlas and Postman screenshots listed in section 8 of the report.
- Export the report as a PDF.
