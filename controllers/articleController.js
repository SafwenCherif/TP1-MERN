let articles = [
  { id: 1, title: 'Welcome to the blog', author: 'Admin' },
  { id: 2, title: 'My first Express server', author: 'Aya' },
  { id: 3, title: 'Testing an API with Postman', author: 'Aya' }
];

let nextArticleId = 4;

const getAllArticles = (req, res) => {
  const { author } = req.query;
  const result = author
    ? articles.filter(article => article.author === author)
    : articles;

  res.status(200).json({ total: result.length, articles: result });
};

const getArticleById = (req, res) => {
  const id = Number(req.params.id);
  const article = articles.find(item => item.id === id);

  if (!article) {
    return res.status(404).json({
      error: `Article ${req.params.id} not found`
    });
  }

  res.status(200).json(article);
};

const createArticle = (req, res) => {
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
};

const updateArticle = (req, res) => {
  const id = Number(req.params.id);
  const { title, author } = req.body ?? {};
  const index = articles.findIndex(article => article.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: `Article ${req.params.id} not found`
    });
  }

  if (typeof title === 'string' && title.trim()) {
    articles[index].title = title.trim();
  }
  if (typeof author === 'string' && author.trim()) {
    articles[index].author = author.trim();
  }

  res.status(200).json({
    message: 'Article updated',
    article: articles[index]
  });
};

const deleteArticle = (req, res) => {
  const id = Number(req.params.id);
  const articleExists = articles.some(article => article.id === id);

  if (!articleExists) {
    return res.status(404).json({
      error: `Unable to delete: article ${req.params.id} not found`
    });
  }

  articles = articles.filter(article => article.id !== id);

  res.status(200).json({
    message: `Article ${req.params.id} deleted successfully`
  });
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
