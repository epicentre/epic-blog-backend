const Comment = require("../models/Comment");
const User = require("../models/User");
const {getArticleFromSlug} = require('./article.controller');
const CustomError = require('../helpers/CustomError');

const getCommentById = async (id) => {
  let comment;
  try {
    comment = await Comment.findById(id);
  } catch (err) { }

  return comment;
};

const getArticleComments = async (req, res, next) => {
  const articleSlug = req.params.article;
  const article = await getArticleFromSlug(articleSlug);
  if (!article) {
    return next(new CustomError('Article not found', 404));
  }

  const user = req.payload ? await User.findById(req.payload.id) : null;
  try {
    const article2 = await article
    .populate({
      path: "comments",
      populate: {
        path: "author"
      },
      options: {
        sort: {
          createdAt: "desc"
        }
      }
    })
    .execPopulate();

    return res.json({
        data: article2.comments.map(function(comment) {
          return comment.toJSONFor(user);
        })
      });
  } catch (err) {
    return next(err);
  }
};

const postComment = async (req, res, next) => {
  const articleSlug = req.params.article;
  const article = await getArticleFromSlug(articleSlug);
  if (!article) {
    return next(new CustomError('Article not found', 404));
  }

  const user = await User.findById(req.payload.id);
  if (!user) {
    return next(new CustomError('Unauthorized this action', 401));
  }

  const comment = new Comment(req.body.comment);
  comment.article = article;
  comment.author = user;

  try {
    await comment.save();

    article.comments.push(comment);
    await article.save();

    res.json({ data: comment.toJSONFor(user) });
  } catch (err) {
    return next(err);
  }
};

const deleteComment = async (req, res, next) => {
  const articleSlug = req.params.article;
  const commentId = req.params.comment;
  const article = await getArticleFromSlug(articleSlug);
  const comment = await getCommentById(commentId);
  if (!article || !comment) {
    return next(new CustomError('Article or comment not found', 404));
  }

  if (comment.author.toString() !== req.payload.id.toString() && article.author.toString() !== req.payload.id.toString()) {
    return next(new CustomError('Unauthorized this action', 401));
  }

  try {
    article.comments.remove(comment._id);
    
    await article.save();

    // await Comment.remove({ _id: comment._id });
    await comment.remove();

    return res.status(204);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getCommentById,
  getArticleComments,
  postComment,
  deleteComment
};