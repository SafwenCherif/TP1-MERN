const express = require('express');
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
