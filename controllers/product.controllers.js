const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Product = require("../models/Product.model");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");
const getDataUri = require("../utils/datauri");

exports.createProduct = catchAsyncError(async (req, res, next) => {
  const { title, details, stock, category, price, features } = req.body;
  const file = req.file;
  const fileUri = getDataUri(file);
  let video = false;
  let myCloud;
  if (file.mimetype.includes("video")) {
    myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      resource_type: "video",
    });
    video = true;
  } else {
    myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      resource_type: "image",
    });
  }
  const product = await Product.create({
    title,
    details,
    category,
    stock,
    price,
    file: {
      public_id: myCloud.public_id,
      url: myCloud.url,
      isVideo: video,
    },
    features,
  });
  res.status(201).json({
    success: true,
    product,
    video,
  });
});

exports.getProducts = catchAsyncError(async (req, res) => {
  const { category, search } = req.query;
  const products = await Product.find({
    category: {
      $regex: category,
      $options: "i",
    },
    title: {
      $regex: search,
      $options: "i",
    },
  });
  let count;
  if (category == "") {
    count = await Product.countDocuments({});
  } else {
    count = await Product.countDocuments({
      category,
    });
  }

  res.status(200).json({
    success: true,
    products,
  });
});

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.checkCart = catchAsyncError(async (req, res, next) => {
  const product = await Product.findOne({ price: req.body.price });
  if (!product) {
    return res.status(200).json({
      success: false,
      message: "Cart tempered",
    });
  }
  res.status(200).json({
    success: true,
    product,
    message: "Cart not tempered",
  });
});

exports.getFeaturedProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find({
    oldPrice: {
      $gt: 0,
    },
  }).limit(3);
  return res.status(200).json({
    success: true,
    products,
  });
});

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({
    succes: true,
    message: "Product deleted successfully",
  });
});

exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const { title, price, details, features, stock, category, oldPrice } =
    req.body;
  const product = await Product.findById(req.params.id);

  product.title = title;
  product.details = details;
  product.price = price;
  product.stock = stock;
  product.category = category;
  product.features = features;
  product.oldPrice = oldPrice;

  await product.save();

  res.status(200).json({
    succes: true,
    message: "Product updated successfully",
  });
});

exports.uploadCapStyle = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;
  const file = req.file;
  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "image",
  });
  const product = await Product.findById(req.params.id);
  product.capStyles.push({
    icon: {
      public_id: myCloud.public_id,
      url: myCloud.url,
    },
    name,
  });
  await product.save();
  return res.status(200).json({
    success: true,
    message: "Cap style uploaded successfully",
  });
});
