const express = require("express");
const router = express.Router();
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Feature = require("../models/Feature.model");
const singleUpload = require("../middlewares/multer");
const getDataUri = require("../utils/datauri");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/errorHandler");

router.post(
  "/feature",
  singleUpload,
  catchAsyncError(async (req, res, next) => {
    const file = req.file;
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      resource_type: "image",
    });
    const { heading, content, color } = req.body;
    await Feature.create({
      heading,
      color,
      content,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.url,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Feature added",
    });
  })
);
router.get(
  "/features",
  catchAsyncError(async (req, res, next) => {
    const feature = await Feature.find();
    return res.status(200).json({
      success: true,
      features: feature,
    });
  })
);

router.delete(
  "/feature/:id",
  catchAsyncError(async (req, res, next) => {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return next(new ErrorHandler("Feature not found", 404));
    }
    await feature.deleteOne();
    await feature.save();
    return res.status(200).json({
      sucess: true,
      message: "Feature deleted",
    });
  })
);

module.exports = router;
