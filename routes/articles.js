const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getArticles,
  getMyFeed,
  postArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  favoriteArticle,
  unFavoriteArticle
} = require("../controllers/article.controller");
const { getArticleComments, postComment, deleteComment } = require('../controllers/comment.controller');

router.get("/", auth.optional, getArticles);

router.get("/feed", auth.required, getMyFeed);

router.post("/", auth.required, postArticle);

// return a article
router.get("/:article", auth.optional, getArticle);

// update article
router.put("/:article", auth.required, updateArticle);

// delete article
router.delete("/:article", auth.required, deleteArticle);

// Favorite an article
router.post("/:article/favorite", auth.required, favoriteArticle);

// Unfavorite an article
router.delete("/:article/favorite", auth.required, unFavoriteArticle);

// return an article's comments
router.get("/:article/comments", auth.optional, getArticleComments);

// create a new comment
router.post("/:article/comments", auth.required, postComment);

router.delete("/:article/comments/:comment", auth.required, deleteComment);

module.exports = router;
