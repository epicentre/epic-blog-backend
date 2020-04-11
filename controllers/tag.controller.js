const ArticleModel = require("../models/Article");

const getTags = async (req, res, next) => {
  try {
    let tags = await ArticleModel.find().distinct("tagList");
    return res.json({ data: tags });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getTags };