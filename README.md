# Blog API — MERN S3

Express API using Mongoose and MongoDB. The project preserves the Session 2 route/controller layout and stores articles and users in MongoDB. Articles reference their authors by ObjectId; API reads use `.populate()` to include author name and email.

## 1. Configure MongoDB

### Local MongoDB (current development configuration)

The local `.env` currently points to the MongoDB service on this machine:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/blog_api
```

The `.env` file is ignored by Git. The local `mongod` service must be running; verify with:

```bash
mongosh "mongodb://127.0.0.1:27017" --eval 'db.runCommand({ ping: 1 })'
```

### MongoDB Atlas (required by the S3 handout)

1. Create an Atlas project and an M0 cluster.
2. Under **Database Access**, create a database user with read/write access.
3. Under **Network Access**, allow your current public IP (the handout permits `0.0.0.0/0` for lab use; restrict this outside a temporary lab).
4. In **Database → Connect → Drivers**, copy the Node.js URI. Replace the local `MONGODB_URI` value in `.env` with that URI and select the `blogDB` database in its path.
5. URL-encode special characters in the database user's password. Never commit `.env` or expose its URI in screenshots.

`.env.example` is a credential-free template. `dotenv` loads `.env` when the server and seed script start.

## 2. Install, migrate/seed, and run

From the project directory:

```bash
npm install
npm run seed
npm run dev
```

`npm run seed` inserts sample users/articles if needed and migrates the earlier local article records from a text author to a User ObjectId reference. It is safe to re-run. The server listens at `http://localhost:3000` only after its MongoDB connection succeeds.

The API's CRUD routes are:

- `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `DELETE /api/users/:id`
- `GET /api/articles`, `GET /api/articles/:id`, `POST /api/articles`, `PUT /api/articles/:id`, `DELETE /api/articles/:id`
- `POST /contact`

Use MongoDB `_id` values, not the old numeric IDs. Article POST bodies use `title`, `content`, and `authorId` (the author's MongoDB `_id`). A user with articles cannot be deleted until those articles have been removed.

## 3. Postman

Import [`S3_Postman_Collection.json`](S3_Postman_Collection.json) into Postman. Requests are numbered in execution order and include assertions for status codes, validation, unique email, `.populate()`, malformed ObjectIds, and referential integrity. Run requests one by one in order. After request 10, stop and restart the API (`Ctrl+C`, then `npm run dev`); then run request 11 to confirm the new article persisted.

Save real Postman and Atlas screenshots under `postman screenshots/Lesson_3/`. Do not include passwords, connection URIs, or other secrets in captures.
