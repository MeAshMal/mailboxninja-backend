const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  heading: {
    type: String,
  },
  image: {
    public_id: String,
    url: String,
  },
  content: {
    type: String,
  },
  color: String,
});

const Feature = mongoose.model("Feature", schema);

module.exports = Feature;
