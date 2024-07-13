const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  phone: {
    type: String,
  },

  address: [
    {
      state: String,
      city: String,
      street: String,
      pincode: String,
    },
  ],
  paymentInformation: {
    creditCard: String,
    visa: String,
    masterCard: String,
  },
  referralCode: {
    type: String,
    required: true,
  },
  referrals: Array,

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

schema.methods.generateToken = async function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

schema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

schema.methods.passwordCompare = async function (password) {
  return await bcrypt.compare(password, this.password);
};

schema.methods.getResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", schema);
