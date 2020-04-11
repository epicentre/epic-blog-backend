const User = require("../models/User");
const Article = require("../models/Article");
const Comment = require("../models/Comment");
const CustomError = require('../helpers/CustomError');

const getArticleFromSlug = async (slug) => {
  let article;
  try {
    article = await Article.findOne({ slug: slug }).populate("author");
  } catch (err) { }

  return article;
};

const getArticles = async (req, res, next) => {
  const query = {};
  const limit = 20;
  const offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }

  if (typeof req.query.tag !== "undefined") {
    query.tagList = { $in: [req.query.tag] };
  }

  if (typeof req.query.author !== "undefined") {
    const author = await User.findOne({ username: req.query.author });
    if (!author) {
      return res.json({
        data: [],
        articlesCount: 0
      });
    }

    query.author = author._id;
  }

  if (typeof req.query.favorited !== "undefined") {
    const favoriter = await User.findOne({ username: req.query.favorited });
    if (!favoriter) {
      return res.json({
        data: [],
        articlesCount: 0
      });
    }
    
    query._id = { $in: favoriter.favorites };
  }

  const articles = await Article.find(query)
    .limit(Number(limit))
    .skip(Number(offset))
    .sort({ createdAt: "desc" })
    .populate("author")
    .exec();
  const articlesCount = await Article.countDocuments(query).exec();
  const user = req.payload ? await User.findById(req.payload.id) : null;

  return res.json({
    data: articles.map(article => {
      return article.toJSONFor(user);
    }),
    articlesCount
  });
};

const getMyFeed = async (req, res, next) => {
  const limit = 20;
  const offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }

  const user = await User.findById(req.payload.id);
  if (!user) {
    return next(new CustomError('Unauthorized this action', 401));
  }

  const articles = await Article.find({ author: { $in: user.following } })
    .limit(Number(limit))
    .skip(Number(offset))
    .populate("author")
    .exec();
  const articlesCount = await Article.countDocuments({
    author: { $in: user.following }
  });

  return res.json({
    data: articles.map(function(article) {
      return article.toJSONFor(user);
    }),
    articlesCount: articlesCount
  });
};

const postArticle = async (req, res, next) => {
  const user = await User.findById(req.payload.id);
  if (!user) {
    return next(new CustomError('Unauthorized this action', 401));
  }

  try {
    const article = new Article(req.body.article);

    article.author = user;

    await article.save();

    return res.json({ data: article.toJSONFor(user) });

  } catch (err) {
    return next(err);
  }
};

const getArticle = async (req, res, next) => {
  const articleSlug = req.params.article;
  const article = await getArticleFromSlug(articleSlug);
  if (!article) {
    return next(new CustomError('Article not found', 404));
  }
  const user = req.payload ? await User.findById(req.payload.id) : null;

  return res.json({ data: article.toJSONFor(user) });
};

const updateArticle = async (req, res, next) => {
  const articleSlug = req.params.article;
  const article = await getArticleFromSlug(articleSlug);
  if (!article) {
    return next(new CustomError('Article not found', 404));
  }
  const user = await User.findById(req.payload.id);

  if (article.author._id.toString() !== req.payload.id.toString()) {
    return next(new CustomError('Unauthorized this action', 403));

  }

  if (typeof req.body.article.title !== "undefined") {
    article.title = req.body.article.title;
  }

  if (typeof req.body.article.description !== "undefined") {
    article.description = req.body.article.description;
  }

  if (typeof req.body.article.body !== "undefined") {
    article.body = req.body.article.body;
  }

  if (typeof req.body.article.tagList !== "undefined") {
    article.tagList = req.body.article.tagList;
  }

  try {
    await article.save();

    return res.json({ data: article.toJSONFor(user) });
  } catch (err) {
    return next(err);
  }
};

const deleteArticle = async (req, res, next) => {
  const articleSlug = req.params.article;
  const article = await getArticleFromSlug(articleSlug);
  if (!article) {
    return next(new CustomError('Article not found', 404));
  }

  const user = await User.findById(req.payload.id);
  if (!user) {
    return next(new CustomError('Unauthorized this action', 401));
  }

  if (article.author._id.toString() !== req.payload.id.toString()) {
    return next(new CustomError('Unauthorized this action', 401));
  }
  
  try {
    await article.remove();

    // TODO: article comments and users favourited update


    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
};

const favoriteArticle = async (req, res, next) => {
  const articleSlug = req.params.article;
  const article = await getArticleFromSlug(articleSlug);
  if (!article) {
    return next(new CustomError('Article not found', 404));
  }

  const articleId = article._id;

  const user = await User.findById(req.payload.id);
  if (!user) {
    return next(new CustomError('Unauthorized this action', 401));
  }

  try {
    await user.favorite(articleId);

    await article.updateFavoriteCount();
    
    return res.json({ data: article.toJSONFor(user) });
  } catch (err) {
    return next(err);
  }
};

const unFavoriteArticle = async (req, res, next) => {
  const articleSlug = req.params.article;
  const article = await getArticleFromSlug(articleSlug);
  if (!article) {
    return next(new CustomError('Article not found', 404));
  }

  const articleId = article._id;

  const user = await User.findById(req.payload.id);

  if (!user) {
    return next(new CustomError('Unauthorized this action', 401));
  }

  try {
    await user.unfavorite(articleId);

    await article.updateFavoriteCount();
    
    return res.json({ data: article.toJSONFor(user) });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getArticleFromSlug,
  getArticles,
  getMyFeed,
  postArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  favoriteArticle,
  unFavoriteArticle
};
