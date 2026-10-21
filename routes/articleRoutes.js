const express = require('express');
const articleController = require('../controllers/articleController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', articleController.getAllArticles);
router.get('/my-articles', protect, articleController.getMyArticles);
router.get('/:id', articleController.getArticleById);
router.post('/', protect, articleController.createArticle);
router.put('/:id', protect, articleController.updateArticle);
router.delete('/:id', protect, articleController.deleteArticle);

module.exports = router;
