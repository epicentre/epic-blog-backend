const router = require("express").Router();
const auth = require("../middleware/auth");
const {currentUser, updateUser, getProfile, followUser, unfollowUser} = require('../controllers/user.controller');

router.get("/", auth.required, currentUser);

router.put("/", auth.required, updateUser);

router.get('/:username', auth.optional, getProfile);

router.post('/:username/follow', auth.required, followUser);

router.delete('/:username/follow', auth.required, unfollowUser);

module.exports = router;