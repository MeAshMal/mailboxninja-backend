const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Order = require("../models/Order.model");
const ErrorHandler = require("../utils/errorHandler");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const Product = require("../models/Product.model");
const { codes } = require("../alpha-2-codes");
const User = require("../models/User.model");

exports.createOrder = catchAsyncError(async (req, res) => {
  const { orderItems, shippingDetails, totalPrice, orderType } = req.body;
  const user = await User.findById({ _id: req.user._id });
  console.log(`before ${totalPrice}`);
  if (user.referrals.length > 0) {
    const discount = (totalPrice * 10) / 100;

    totalPrice = totalPrice - discount;
  }
  console.log(`after ${totalPrice}`);

  const order = await Order.create({
    orderItems,
    shippingDetails,
    totalPrice,
    orderType,
    user: req.user._id,
  });
  res.status(200).json({
    success: true,
    order,
    message: "Order Placed successfully",
  });
});

exports.createPayment = catchAsyncError(async (req, res) => {
  let { orderItems, totalPrice } = req.body;
  const user = await User.findById({ _id: req.user._id });
  console.log(`before ${totalPrice}`);
  let discount = 0;
  if (user.referrals.length > 0) {
    discount = (totalPrice * 10) / 100;

    totalPrice = Math.floor(totalPrice - discount);
  }
  console.log(`after ${totalPrice}`);

  // const orderData = orderItems.map((item) => {
  //   return {
  //     _id: item._id,
  //     quantity: item.qty,
  //     title: item.title,
  //     price: item.price - discount,
  //     userId: req.user._id,
  //   };
  // });
  const customer = await stripe.customers.create({
    email: req.user.email,
    name: req.user.name,
    // metadata: {
    //   cart: orderData.toString(),
    //   id: req.user._id,
    // },
  });

  const order = new Order({
    totalPrice: parseInt(totalPrice),
    orderType: "Online",

    user: req.user._id,
  });
  orderItems.forEach((item) => {
    order.orderItems.push({
      title: item.title,
      price: item.price,
      file: { url: item.image },
      qty: item.qty,
      stock: item.stock,
      isVideo: item.video,
      capStyle: item.capStyle,
      _id: item._id,
    });
  });
  await order.save();
  const session = await stripe.checkout.sessions.create({
    shipping_address_collection: {
      allowed_countries: codes,
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 0,
            // amount: Math.floor(totalPrice - discount),
            currency: "usd",
          },
          display_name: "Free shipping",
          // Delivers between 5-7 business days
          // delivery_estimate: {
          //   minimum: {
          //     unit: "business_day",
          //     value: 4,
          //   },
          //   maximum: {
          //     unit: "business_day",
          //     value: 7,
          //   },
          // },
        },
      },
    ],
    line_items: orderItems.map((item) => {
      actualPrice = item.price * 100;
      actualPrice = (actualPrice - discount).toFixed(1);
      console.log({ actualPrice });
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            description: item.details,
            metadata: {
              id: item._id,
            },
          },
          unit_amount_decimal: Math.floor(actualPrice),
        },
        quantity: item.qty,
      };
    }),
    customer: customer.id,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/trackorder/${order._id}`,
    cancel_url: `${process.env.FRONTEND_URL}/cart`,
  });
  order.paymentInfo.status = session.payment_status;
  order.paymentInfo.payment_id = session.id;
  await order.save();
  res.json({ url: session.url });
});

exports.processOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }
  if (order.status === "Processing") {
    order.status = "Shipped";
  } else if (order.status === "Shipped") {
    order.status = "Delivered";
  } else {
    return next(new ErrorHandler("Order already delivered", 401));
  }
  order.orderItems.forEach(async (orderItem) => {
    const product = await Product.findById(orderItem._id);
    if (!product) return;
    product.stock = parseInt(product.stock) - orderItem.qty;
    await product.save();
  });
  await order.save();
  return res.status(200).json({
    success: true,
    message: "Order processed successfully",
  });
});

exports.getOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorHandler("No order found", 404));

  return res.status(200).json({
    success: true,
    order,
  });
});

exports.getMyOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  return res.status(200).json({
    orders,
    success: true,
  });
});

exports.getOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find().populate("user");
  return res.status(200).json({
    orders,
    success: true,
  });
});
