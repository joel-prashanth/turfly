const paymentService = require("./payment.service");

const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const result = await paymentService.createRazorpayOrder(
      bookingId,
      req.user.id,
    );

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      data: result,
    });
  } catch (error) {
    console.error("CREATE_RAZORPAY_ORDER_ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create Razorpay order",
      error,
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const result = await paymentService.verifyRazorpayPayment({
      bookingId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      playerId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: result,
    });
  } catch (error) {
    console.error("VERIFY_RAZORPAY_PAYMENT_ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to verify Razorpay payment",
      error,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
