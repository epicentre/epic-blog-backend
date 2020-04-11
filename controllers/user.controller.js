const User = require("../models/User");
const CustomError = require("../helpers/CustomError");

const currentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.id);
    if (!user) {
      throw new CustomError("User not found", 400);
    }

    return res.json({ data: user.toAuthJSON() });
  } catch (err) {
    return next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.id);
    if (!user) {
      throw new CustomError("User not found", 400);
    }

    // only update fields that were actually passed...
    if (typeof req.body.user.username !== "undefined") {
      user.username = req.body.user.username;
    }
    if (typeof req.body.user.email !== "undefined") {
      user.email = req.body.user.email;
    }
    if (typeof req.body.user.bio !== "undefined") {
      user.bio = req.body.user.bio;
    }
    if (typeof req.body.user.image !== "undefined") {
      user.image = req.body.user.image;
    }
    if (typeof req.body.user.password !== "undefined") {
      user.password = req.body.user.password;
    }

    await user.save();

    return res.json({ data: user.toAuthJSON() });
  } catch (err) {
    return next(err);
  }
};

const getUserFromName = async (username) => {
  let user;
  try {
    user = await User.findOne({ username: username });
  } catch (err) {}

  return user;
};

const getProfile = async (req, res, next) => {
  let profile = await getUserFromName(req.params.username);
  if (!profile) {
    return next(new CustomError("User not found", 400));
  }

  if (req.payload) {
    let user = await User.findById(req.payload.id);

    return res.json({ data: profile.toProfileJSONFor(user) });
  } else {
    return res.json({ data: profile.toProfileJSONFor(false) });
  }
};

const followUser = async (req, res, next) => {
  let profile = await getUserFromName(req.params.username);
  if (!profile) {
    return next(new CustomError("User not found", 400));
  }
  const profileId = profile._id;

  try {
    let user = await User.findById(req.payload.id);

    await user.follow(profileId);

    return res.json({ data: profile.toProfileJSONFor(user) });
  } catch (err) {
    return next(err);
  }
};

const unfollowUser = async (req, res, next) => {
  let profile = await getUserFromName(req.params.username);
  if (!profile) {
    return next(new CustomError("User not found", 400));
  }
  const profileId = profile._id;

  try {
    let user = await User.findById(req.payload.id);

    await user.unfollow(profileId);

    return res.json({ data: profile.toProfileJSONFor(user) });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  currentUser,
  updateUser,
  getProfile,
  followUser,
  unfollowUser
};
