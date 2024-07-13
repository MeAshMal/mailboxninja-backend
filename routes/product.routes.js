const express = require("express");
const router = express.Router();
const { isAuthenticated, authorizeAdmin } = require("../middlewares/auth");
const singleUpload = require("../middlewares/multer");
const {
  createProduct,
  getProducts,
  getProductDetails,
  checkCart,
  getFeaturedProducts,
  deleteProduct,
  updateProduct,
  uploadCapStyle,
} = require("../controllers/product.controllers");

router
  .route("/create/product")
  .post(isAuthenticated, authorizeAdmin, singleUpload, createProduct);
router.route("/products").get(getProducts);
router
  .route("/product/:id")
  .get(getProductDetails)
  .delete(isAuthenticated, authorizeAdmin, deleteProduct)
  .put(isAuthenticated, authorizeAdmin, updateProduct);
router.route("/checkcart").post(checkCart);
router.route("/featuredProducts").get(getFeaturedProducts);
router
  .route("/upload/cap/:id")
  .put(isAuthenticated, authorizeAdmin, singleUpload, uploadCapStyle);

module.exports = router;
