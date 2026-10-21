require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Article = require('./models/Article');
const User = require('./models/User');

const sampleUsers = [
  { name: 'Aya', email: 'aya@example.com', age: 22, role: 'user' },
  { name: 'Admin', email: 'admin@example.com', role: 'admin' },
  { name: 'Alex', email: 'alex@example.com', role: 'user' }
];

const sampleArticles = [
  {
    title: 'Welcome to the blog',
    content: 'A first article introducing the blog.',
    authorEmail: 'admin@example.com'
  },
  {
    title: 'My first Express server',
    content: 'Notes from building the first Express server.',
    authorEmail: 'aya@example.com'
  },
  {
    title: 'Testing an API with Postman',
    content: 'A short guide to testing API endpoints with Postman.',
    authorEmail: 'aya@example.com'
  }
];

async function seedDatabase() {
  await connectDB(process.env.MONGODB_URI);

  const usersByEmail = new Map();
  for (const data of sampleUsers) {
    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = await User.create(data);
    } else if (!['user', 'admin'].includes(user.role)) {
      user.role = data.role;
      await user.save();
    }
    usersByEmail.set(data.email, user);
  }

  const articleCollection = mongoose.connection.db.collection('articles');
  const legacyArticles = await articleCollection
    .find({ author: { $type: 'string' } })
    .toArray();

  for (const legacyArticle of legacyArticles) {
    const authorName = legacyArticle.author.trim();
    let author = await User.findOne({ name: authorName });
    if (!author) {
      const email = `legacy.${legacyArticle._id}@example.invalid`;
      author = await User.findOne({ email });
      if (!author) {
        author = await User.create({
          name: authorName || 'Legacy author',
          email,
          role: 'user'
        });
      }
    }

    const sample = sampleArticles.find(article => article.title === legacyArticle.title);
    await articleCollection.updateOne(
      { _id: legacyArticle._id },
      {
        $set: {
          author: author._id,
          content: legacyArticle.content || sample?.content || 'Imported from the previous API version.',
          updatedAt: new Date()
        }
      }
    );
  }

  for (const data of sampleArticles) {
    const author = usersByEmail.get(data.authorEmail);
    const existing = await articleCollection.findOne({ title: data.title });

    if (existing) {
      await articleCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            content: !existing.content || existing.content.startsWith('Imported from the previous API version.')
              ? data.content
              : existing.content,
            author: author._id,
            updatedAt: new Date()
          }
        }
      );
    } else {
      await Article.create({
        title: data.title,
        content: data.content,
        author: author._id
      });
    }
  }

  console.log('Sample users and populated articles are ready.');
}

seedDatabase()
  .catch(error => {
    console.error(`Unable to seed MongoDB: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
