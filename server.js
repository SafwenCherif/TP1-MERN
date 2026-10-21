require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const connectDB = require('./config/db');
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const STUDENT_NAME = process.env.STUDENT_NAME || 'Safwen Cherif';

app.use(express.json());

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

app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);

app.post('/contact', async (req, res) => {
  try {
    const { email, message } = req.body ?? {};

    if (typeof email !== 'string' || !email.trim() ||
        typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Email and message are required'
      });
    }

    await Contact.create({ email: email.trim(), message: message.trim() });
    res.status(200).json({
      message: 'Thank you, your message has been received'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function startServer() {
  await connectDB(process.env.MONGODB_URI);

  const server = app.listen(PORT, () => {
    console.log(`Serveur MERN en écoute sur http://localhost:${PORT}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (require.main === module) {
  startServer().catch(error => {
    console.error('Erreur critique de démarrage du serveur :', error.message);
    process.exit(1);
  });
}

module.exports = app;
