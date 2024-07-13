const router = require("express").Router();
const {
  login,
  register,
  getAllUsers,
  getLoggedInUserDetails,
  logout,
  getMyDetails,
  addAddress,
  changePassword,
  updateRole,
  forgotPassword,
  resetPassword,
} = require("../controllers/user.controllers");
const { isAuthenticated, authorizeAdmin } = require("../middlewares/auth");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/users").get(isAuthenticated, authorizeAdmin, getAllUsers);
router.route("/user").get(isAuthenticated, getLoggedInUserDetails);
router.route("/logout").get(isAuthenticated, logout);
router.route("/me").get(isAuthenticated, getMyDetails);
router.route("/address").post(isAuthenticated, addAddress);
router.route("/changepassword").put(isAuthenticated, changePassword);
router.route("/forgotpassword").post(forgotPassword);
router
  .route("/updaterole/:id")
  .put(isAuthenticated, authorizeAdmin, updateRole);
router.route("/password/reset/:token").put(resetPassword);

module.exports = router;
