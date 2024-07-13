const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    orderItems: [
      {
        title: {
          type: String,
          required: true,
        },
        price: {
          type: String,
          required: true,
        },

        details: {
          type: String,
        },

        file: {
          public_id: String,
          url: String,
        },
        qty: {
          type: Number,
          required: true,
        },
        isVideo: Boolean,
        stock: {
          type: String,
        },
        capStyle: {
          name: String,
        },
        _id: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    // shippingDetails: {
    //   address: {
    //     type: String,
    //     required: true,
    //   },
    //   pincode: {
    //     type: Number,
    //     required: true,
    //   },
    //   email: String,
    //   country: {
    //     type: String,
    //     required: true,
    //   },
    //   state: {
    //     type: String,
    //     required: true,
    //   },
    //   city: {
    //     type: String,
    //     required: true,
    //   },
    //   phone: {
    //     type: String,
    //     required: true,
    //   },
    // },
    paymentInfo: {
      status: {
        type: String,
      },
      payment_intent: String,
      customer: String,
      payment_id: String,
      amount_total: Number,
      default: {},
    },
    totalPrice: Number,
    orderType: {
      type: String,
      enum: ["COD", "Online"],
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      default: "Processing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", schema);
