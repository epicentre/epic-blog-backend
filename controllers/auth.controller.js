const User = require("../models/User");
const CustomError = require("../helpers/CustomError");

const login = async (req, res, next) => {
  if (!req.body.user || !req.body.user.email || !req.body.user.password) {
    return next(new CustomError("Email and password can't be blank", 422));
  }

  try {
    const { email, password } = req.body.user;
    // Search for a user by email and password.
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError("User not found", 400);
    }
    const isPasswordMatch = await user.validPassword(password);
    if (!isPasswordMatch) {
      throw new CustomError("Invalid login credentials", 400);
    }

    res.json({ data: user.toAuthJSON() });
  } catch (err) {
    return next(err);
  }
};

const register = async (req, res, next) => {
    if (
      !req.body.user ||
      !req.body.user.username ||
      !req.body.user.email ||
      !req.body.user.password
    ) {
      return next(
        new CustomError("Username, email and password can't be blank", 422)
      );
    }

    try {
      const user = new User();

      user.username = req.body.user.username;
      user.email = req.body.user.email;
      user.password = req.body.user.password;

      await user.save();

      return res.json({ data: user.toAuthJSON() });
    } catch (err) {
      return next(err);
    }
};

module.exports = {
  login,
  register
};
