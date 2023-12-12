const Order = require("../models/orderModel");
const resolveAsyncError = require("../middleware/resolveAsyncError");
const ErrorHandler = require("../utils/Error");
const Product = require("../models/productModel");
const mongoose = require('mongoose');
//Placed new Order
const newOrder = resolveAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});



//to see specific order
const particularOrder = resolveAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order)
    return next(new ErrorHandler("Order is not found with this ID", 404));

  res.status(200).json({
    success: true,
    order,
  });
});
//Myorder
// const myOrders = resolveAsyncError(async (req, res, next) => {
//   // const {user} = req.user._id; 
//   // const orders = await Order.find(user);
//   // const orders = await Order.find({ user : req.user._id});
  
//   const orders = await Order.find( {user : req.user._id});
//   res.status(200).json({
//     success: true,
//     orders : orders,
//   });
// });


const myOrders = resolveAsyncError(async(req,res,next)=>{
  const userId = req.params.id;
  const orders = await Order.find({user : userId});
  if(!orders) return next(new ErrorHandler("Orders list is empty.", 404));
  res.status(200).json({
    success : true,
    orders,
  })
})
// const myOrders = resolveAsyncError(async (req, res, next) => {
//   const userId = mongoose.Types.ObjectId(req.user._id);
//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//       return next(new ErrorHandler("Invalid or missing user ID", 400));
//     }

//     const orders = await Order.findOne({ user: userId });

//     res.status(200).json({
//       success: true,
//       orders: orders,
//     });
// });
// calculate total cost of all orders placed by user (admin)
const getAllOrders = resolveAsyncError(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//Order delivery and update order status
const updateOrder = resolveAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    return next(
      new ErrorHandler("Order has not been placed by this user", 404)
    );
  if (order.orderStatus === "Delivered") {
    return next(
      new ErrorHandler(
        "Order has Been Delieverd to the respective customer",
        400
      )
    );
  }
  // if(req.body.status === "shipped"){
  //     order.orderItems.forEach(async(o)=>{
  //         await updateStock(o.product,o.quantity);
  //     });
  // }

  order.orderItems.forEach(async (o) => {
    await updateStock(o.product, o.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}

//delete order
const deleteOrder = resolveAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    return next(
      new ErrorHandler("Order has not been placed by this user", 404)
    );

  await Order.deleteOne(order);
  res.status(200).json({
    success: true,
    message: "Order Cancelled successfully",
  });
});

module.exports = {
  newOrder,
  particularOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
};
