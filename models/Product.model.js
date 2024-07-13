const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  file: {
    public_id: String,
    url: String,
    isVideo: Boolean,
  },
  stock: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
    required: false,
    default: 0,
  },
  capStyles: [
    {
      icon: {
        public_id: String,
        url: String,
      },
      name: String,
    },
  ],
  features: String,
  comment: [
    {
      name: {
        type: String,
      },
      comment: {
        type: String,
      },
    },
  ],
  price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Product", schema);
