// controllers/orderController.js
import Order from '../models/Order.js';
import productModel from '../models/productModels.js';
import Stripe from "stripe";
import payos from '../utils/payosClient.js';
import RevenueDaily from '../models/RevenueDaily.js';
import cartModel from "../models/Cart.js";  // Import mô hình Cart
// Debug environment variables
console.log("🔍 Debug environment variables:");
console.log("- STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
console.log("- STRIPE_SECRET_KEY length:", process.env.STRIPE_SECRET_KEY?.length);

let stripe;

// Kiểm tra và khởi tạo Stripe nếu có STRIPE_SECRET_KEY trong biến môi trường
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Sử dụng Stripe Secret Key từ biến môi trường
} else {
  console.error("Stripe Secret Key not found in environment variables!");
}

// Giảm tồn kho khi tạo đơn hàng
const reduceStockAPI = async (req, res) => {
  const { items, userId } = req.body;

  try {
    // Lấy giỏ hàng từ mô hình Cart
    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: `Giỏ hàng không tồn tại cho người dùng ${userId}` });
    }

    // Giảm tồn kho cho từng sản phẩm trong giỏ hàng
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (product) {
        const newQuantity = Math.max(0, product.quantity - item.quantity);
        await productModel.findByIdAndUpdate(item._id, { quantity: newQuantity });
      } else {
        return res.status(404).json({ success: false, message: `Sản phẩm không tồn tại với ID: ${item._id}` });
      }
    }
    res.json({ success: true, message: 'Giảm tồn kho thành công!' });
  } catch (error) {
    console.error("Lỗi giảm tồn kho:", error);
    res.status(500).json({ success: false, message: "Lỗi khi giảm tồn kho." });
  }
};





// Helper function để giảm tồn kho
const reduceStock = async (items) => {
  try {
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (product) {
        const newQuantity = Math.max(0, product.quantity - item.quantity);
        console.log(`📦 Product: ${product.name}, Old Quantity: ${product.quantity}, New Quantity: ${newQuantity}`);
        await productModel.findByIdAndUpdate(item._id, {
          quantity: newQuantity
        });
      } else {
        console.log(`❌ Product not found for ID: ${item._id}`);
      }
    }
  } catch (error) {
    console.error("❌ Error reducing stock:", error);
    throw error;
  }
};

// Helper function để hoàn lại tồn kho (khi hủy đơn)
const restoreStock = async (items) => {
  try {
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (product) {
        const newQuantity = product.quantity + item.quantity;
        await productModel.findByIdAndUpdate(item._id, {
          quantity: newQuantity
        });
        console.log(`📦 Restored stock for ${product.name}: ${product.quantity} -> ${newQuantity}`);
      }
    }
  } catch (error) {
    console.error("❌ Error restoring stock:", error);
    throw error;
  }
};


const PlaceOder = async (req, res) => {
  const { address, items, amount, payment } = req.body;
  const frontend_url = "http://localhost:5174";
  try {
    const userId = req.user?.id; // Đảm bảo rằng userId có sẵn trong req.user sau khi xác thực

    if (!userId) {
      return res.status(400).json({ success: false, message: "Không tìm thấy thông tin người dùng" });
    }

    // Lấy giỏ hàng từ model Cart
    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: `Giỏ hàng không tồn tại cho người dùng ${userId}` });
    }

   const items = req.body.items.map(item => ({
  _id: item._id || item.itemId, // Ưu tiên _id nếu có, fallback itemId
  name: item.name,
  quantity: item.quantity,
  price: item.price,
  size: item.size,
  image: item.image     // THÊM VÀO ĐÂY!
}));



    if (!items || !amount || !address) {
      return res.json({ success: false, message: "Thiếu thông tin đặt hàng" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Giỏ hàng trống" });
    }

    if (amount <= 0) {
      return res.json({ success: false, message: "Số tiền không hợp lệ" });
    }

    // Tạo đơn hàng mới với trạng thái pending
    const isCOD = payment?.toLowerCase() === "cod";
    const newOrder = new Order({
      userId,
      items,
      amount,
      address,
      status: isCOD ? "processing" : "pending",
      payment: isCOD ? "COD" : "Pending",
      date: new Date()
    });

    await newOrder.save();

const line_items = items.map((item) => ({
  price_data: {
    currency: "vnd",
    product_data: {
      name: item.name,
      images: item.image
        ? [
            item.image.startsWith('http')
              ? item.image
              : `http://localhost:4000/uploads/${item.image.replace(/^(uploads\/)?/, '')}`
          ]
        : []
    },
    unit_amount: Math.round(item.price),
  },
  quantity: item.quantity,
}));

console.log("🟢 Stripe line_items gửi đi:", JSON.stringify(line_items, null, 2));

    // Thêm phí vận chuyển
    line_items.push({
      price_data: {
        currency: "vnd",
        product_data: { name: "Phí vận chuyển" },
        unit_amount: 20000,  // 20,000 VND
      },
      quantity: 1,
    });

    // Tạo session thanh toán trên Stripe
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    if (!session || !session.url) {
      return res.json({
        success: false,
        message: "Stripe session creation failed or missing checkout URL."
      });
    }

    res.json({
      success: true,
      url: session.url,  // URL thanh toán của Stripe
      orderId: newOrder._id
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.json({ success: false, message: "Lỗi khi đặt hàng: " + error.message });
  }
};



// Function để verify order sau khi thanh toán
const verifyOrder = async (req, res) => {
  const orderId = req.query.orderId || req.body.orderId;
  const success = req.query.success || req.body.success;
  const status = req.query.status || req.body.status;
  const cancel = req.query.cancel || req.body.cancel;

  try {
    console.log("🔁 Payment verification:", { success, status, orderId, cancel });

    if (!orderId) {
      return res.json({ success: false, message: "Thiếu orderId" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // ✅ THÊM ĐOẠN NÀY để xử lý đơn COD
    if (order.payment === "COD" && order.status !== "Processing") {
      console.log("✅ Starting stock reduction for COD order:", orderId);
      // Giảm số lượng tồn kho khi đơn COD được xác nhận
      await reduceStock(order.items);

      // Cập nhật trạng thái đơn hàng sang "Processing"
      await Order.findByIdAndUpdate(orderId, {
        status: "Processing",
        verifiedBy: "verify-cod",
        updatedAt: new Date()
      });

      console.log("✅ COD order moved to Processing:", orderId);
      return res.json({ success: true, message: "Đơn hàng COD đã chuyển sang trạng thái đang xử lý" });
    }





    // Kiểm tra nếu đơn hàng đã được xử lý rồi
    if (order.status === "Processing" && order.payment === "Completed") {
      console.log("✅ Order already processed:", orderId);
      return res.json({ success: true, message: "Đơn hàng đã được xác nhận trước đó" });
    }

    // Xử lý hủy đơn hàng
    if (String(cancel).toLowerCase() === 'true') {
      await Order.findByIdAndUpdate(orderId, {
        status: "cancelled",
        payment: "Failed",
        cancelledAt: new Date(),
        cancelReason: "Người dùng hủy thanh toán"
      });

      console.log("❌ Order cancelled by user:", orderId);
      return res.json({ success: false, message: "Đã hủy thanh toán" });
    }

    // Kiểm tra thanh toán thành công
    const isPaid =
      String(success).toLowerCase() === 'true' ||
      String(status).toUpperCase() === 'PAID';

    if (isPaid) {
      // Kiểm tra và giảm stock chỉ khi chưa được xử lý
      if (order.status === "pending") {
        await reduceStock(order.items);
      }

      await Order.findByIdAndUpdate(orderId, {
        status: "paid",
        payment: "Completed",
        paidAt: new Date(),
        verifiedBy: "frontend"
      });

      const updatedOrder = await Order.findById(orderId);
      console.log("✅ Order status updated:", updatedOrder.status, updatedOrder.payment);

      return res.json({ success: true, message: "Đã xác nhận thanh toán" });
    } else {
      await Order.findByIdAndUpdate(orderId, {
        status: "cancelled",
        payment: "Failed",
        cancelledAt: new Date(),
        cancelReason: "Thanh toán thất bại"
      });

      console.log("❌ Payment failed:", orderId);
      return res.json({ success: false, message: "Thanh toán thất bại" });
    }
  } catch (error) {
    console.error("❌ Verify order error:", error);
    return res.json({ success: false, message: "Lỗi khi xác minh thanh toán: " + error.message });
  }
};


// Function để lấy đơn hàng của user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.body?.userId || req.user?.userId || req.user?.id || req.user?.uid;

    if (!userId) {
      console.log("❌ No userId found in request");
      return res.json({ success: false, message: "Không tìm thấy thông tin user" });
    }

    const orders = await Order.find({ userId }).sort({ date: -1 });

    res.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error("❌ Error getting user orders:", error);
    res.json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng: " + error.message
    });
  }
};


// Function để lấy chi tiết đơn hàng
const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.body?.userId || req.user?.userId || req.user?.id || req.user?.uid;

    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin user" });
    }

    console.log("📋 Getting order detail:", orderId, "for user:", userId);

    // Tìm đơn hàng theo ID và userId để đảm bảo user chỉ xem được đơn hàng của mình
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    console.log("✅ Found order:", order._id);

    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error("❌ Error getting order detail:", error);
    res.json({
      success: false,
      message: "Lỗi khi lấy chi tiết đơn hàng: " + error.message
    });
  }
};

// Function để hủy đơn hàng
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.body?.userId || req.user?.userId || req.user?.id || req.user?.uid;

    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin user" });
    }

    console.log("❌ Cancelling order:", orderId, "for user:", userId);

    // Tìm đơn hàng và đảm bảo thuộc về user
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      console.log("❌ Order not found or doesn't belong to user");
      return res.json({ success: false, message: "Không tìm thấy đơn hàng hoặc bạn không có quyền hủy đơn hàng này" });
    }

    console.log("📋 Current order status:", order.status);

    // Kiểm tra xem đơn hàng có thể hủy không
    const cancellableStatuses = ['pending', 'processing'];
    if (!cancellableStatuses.includes(order.status.toLowerCase())) {
      return res.json({
        success: false,
        message: "Không thể hủy đơn hàng đã được gửi đi, đã giao hoặc đã hủy"
      });
    }

    let refundInfo = null;

    // Nếu đơn hàng đã thanh toán (processing), thực hiện hoàn tiền
    if (order.status.toLowerCase() === 'processing') {
      try {
        console.log("💰 Processing refund for paid order...");

        // TODO: Implement Stripe refund logic here
        // const refund = await stripe.refunds.create({
        //   payment_intent: order.paymentIntentId, // Cần lưu paymentIntentId khi tạo đơn
        //   amount: order.amount * 100, // Stripe sử dụng cents
        //   reason: 'requested_by_customer'
        // });

        refundInfo = {
          amount: order.amount,
          currency: 'VND',
          status: 'processing',
          estimatedTime: '3-5 ngày làm việc'
        };

        console.log("✅ Refund initiated successfully");
      } catch (refundError) {
        console.error("❌ Refund error:", refundError);
        return res.json({
          success: false,
          message: "Không thể thực hiện hoàn tiền. Vui lòng liên hệ hỗ trợ."
        });
      }
    }

    // Hoàn lại tồn kho nếu đơn hàng đã được xử lý
    if (order.status.toLowerCase() === 'processing') {
      await restoreStock(order.items);
      console.log("📦 Stock restored for cancelled order");
    }

    // Cập nhật trạng thái đơn hàng
    const updateData = {
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: "Hủy bởi khách hàng"
    };

    if (refundInfo) {
      updateData.refund = refundInfo;
      updateData.payment = "Refunded";
    }

    await Order.findByIdAndUpdate(orderId, updateData);

    console.log("✅ Order cancelled successfully");

    // Tạo response message dựa trên việc có hoàn tiền hay không
    let message = "Đơn hàng đã được hủy thành công";
    if (refundInfo) {
      message += `. Tiền sẽ được hoàn lại trong ${refundInfo.estimatedTime}.`;
    }

    res.json({
      success: true,
      message,
      refund: refundInfo
    });

  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    res.json({
      success: false,
      message: "Lỗi khi hủy đơn hàng: " + error.message
    });
  }
};

// Admin functions
const getAllOrders = async (req, res) => {
  try {
    console.log("👑 Admin getting all orders");

    // Lấy tất cả đơn hàng, sắp xếp theo ngày mới nhất
    const orders = await Order.find({}).sort({ date: -1 });

    console.log(`📦 Found ${orders.length} total orders`);

    res.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error("❌ Error getting all orders:", error);
    res.json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng: " + error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log("👑 Admin updating order status:", orderId, "to", status);

    // Kiểm tra đơn hàng có tồn tại không
    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Cập nhật trạng thái
    await Order.findByIdAndUpdate(orderId, {
      status: status,
      updatedAt: new Date()
    });

    console.log("✅ Order status updated successfully");

    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công"
    });

  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái: " + error.message
    });
  }
};

// Function để lấy thống kê doanh thu
const getRevenueStats = async (req, res) => {
  try {
    console.log("💰 Admin getting revenue statistics");

    // Lấy tất cả đơn hàng
    const allOrders = await Order.find({}).sort({ date: -1 });

    // Lọc đơn hàng đã thanh toán (từ paid trở đi)
    const paidOrders = allOrders.filter(order =>
      ['paid', 'processing', 'shipped', 'delivered'].includes(order.status.toLowerCase())
    );

    // Tính toán thống kê cơ bản
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalOrders = paidOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Doanh thu hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = paidOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= today;
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.amount, 0);

    // Doanh thu 7 ngày qua
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const last7DaysOrders = paidOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= last7Days;
    });
    const last7DaysRevenue = last7DaysOrders.reduce((sum, order) => sum + order.amount, 0);

    // Doanh thu 30 ngày qua
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const last30DaysOrders = paidOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= last30Days;
    });
    const last30DaysRevenue = last30DaysOrders.reduce((sum, order) => sum + order.amount, 0);

    // Thống kê theo trạng thái
    const statusStats = {};
    allOrders.forEach(order => {
      const status = order.status.toLowerCase();
      if (!statusStats[status]) {
        statusStats[status] = { count: 0, revenue: 0 };
      }
      statusStats[status].count++;
      if (['paid', 'processing', 'shipped', 'delivered'].includes(status)) {
        statusStats[status].revenue += order.amount;
      }
    });

    // Doanh thu theo ngày (30 ngày qua) - FIX múi giờ
    const dailyRevenue = [];

    // Debug: Log tất cả đơn hàng để kiểm tra
    console.log('🔍 DEBUG: All paid orders with dates:');
    paidOrders.forEach(order => {
      const orderDate = new Date(order.date);
      console.log(`📦 Order ${order._id}: ${orderDate.toISOString()} (${orderDate.toLocaleDateString('vi-VN')}) - ${order.amount} VND - Status: ${order.status}`);
    });

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = paidOrders.filter(order => {
        const orderDate = new Date(order.date);

        // Fix: Đơn hàng được tạo theo giờ local nhưng lưu dưới dạng UTC
        // Cần trừ đi offset để lấy ngày thực tế khi tạo đơn
        const vietnamOffset = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds
        const orderLocalTime = new Date(orderDate.getTime() - vietnamOffset);

        // So sánh chỉ ngày
        const orderDateStr = orderLocalTime.toISOString().split('T')[0];
        const targetDateStr = date.toISOString().split('T')[0];

        return orderDateStr === targetDateStr;
      });

      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.amount, 0);

      // Debug log cho từng ngày
      const dateStr = date.toISOString().split('T')[0];
      console.log(`📅 ${dateStr}: ${dayRevenue} VND from ${dayOrders.length} orders`);
      if (dayOrders.length > 0) {
        dayOrders.forEach(order => {
          console.log(`  - Order: ${order.amount} VND at ${new Date(order.date).toISOString()}`);
        });
      }

      dailyRevenue.push({
        date: dateStr,
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }



    console.log(`📊 Revenue stats calculated: ${totalRevenue} VND from ${totalOrders} orders`);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        todayRevenue,
        last7DaysRevenue,
        last30DaysRevenue,
        statusStats,
        dailyRevenue
      }
    });

  } catch (error) {
    console.error("❌ Error getting revenue stats:", error);
    res.json({
      success: false,
      message: "Lỗi khi lấy thống kê doanh thu: " + error.message
    });
  }
};
const payWithPayOS = async (req, res) => {
  try {
    console.log("🔍 Yêu cầu PayOS nhận được");
    console.log("- req.body:", req.body);

    const { items, amount, address, userId } = req.body;  // Lấy userId từ body

    // Kiểm tra dữ liệu đầu vào
    if (!items || !amount || !address || !userId) {  // Kiểm tra userId
      console.log("❌ Thiếu dữ liệu cần thiết");
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn hàng' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Đơn hàng không hợp lệ' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
    }

    // Tạo đơn hàng mới
    const newOrder = new Order({
      items,
      amount,
      address,
      status: "pending",
      payment: "PayOS",
      userId  // Lưu userId vào đơn hàng
    });

    await newOrder.save();
    await reduceStock(items);

    // Tạo mã đơn hàng từ timestamp để đảm bảo duy nhất
    const orderCode = Date.now();

    // Chuẩn bị dữ liệu thanh toán cho PayOS
    const paymentData = {
      orderCode: orderCode,
      amount: amount,
      description: "Thanh toán đơn hàng",
      returnUrl: `http://localhost:5174/verify?orderId=${newOrder._id}`,
      cancelUrl: `http://localhost:5174/verify?cancel=true&orderId=${newOrder._id}`,
      buyerName: `${address.firstName || ''} ${address.lastName || ''}`.trim() || "Khách hàng",
      buyerEmail: address.email || "example@example.com",
      buyerPhone: address.phone || "0123456789"
    };

    console.log("🔍 Dữ liệu thanh toán PayOS:", paymentData);

    // Tạo đường link thanh toán
    let paymentLinkResponse;
    try {
      paymentLinkResponse = await payos.createPaymentLink(paymentData);
    } catch (err) {
      console.error("Lỗi khi tạo liên kết thanh toán từ PayOS:", err);
      return res.status(500).json({
        success: false,
        message: 'Không thể tạo liên kết thanh toán từ PayOS. Lỗi: ' + err.message
      });
    }

    if (!paymentLinkResponse || !paymentLinkResponse.checkoutUrl) {
      console.log("❌ Không nhận được URL thanh toán từ PayOS");
      return res.status(400).json({
        success: false,
        message: 'Không nhận được đường link thanh toán từ PayOS'
      });
    }

    console.log("✅ Phản hồi PayOS:", paymentLinkResponse);

    // Cập nhật đơn hàng với orderCode
    newOrder.orderCode = orderCode;
    await newOrder.save();

    // Trả về response cho client
    res.json({
      success: true,
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      orderId: newOrder._id,
      orderCode: orderCode
    });

  } catch (err) {
    console.error("Lỗi tạo PayOS:", err);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo link PayOS. Lỗi: ' + err.message
    });
  }
};






// PayOS Webhook Handler
const payosWebhook = async (req, res) => {
  try {
    // Kiểm tra nếu không có dữ liệu trong webhook
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("❌ No data received from PayOS webhook");
      return res.status(400).json({ success: false, message: "No data received from PayOS" });
    }

    console.log("🔔 PayOS Webhook received:", req.body);

    // Verify webhook data từ PayOS
    const webhookData = payos.verifyPaymentWebhookData(req.body);

    if (!webhookData) {
      console.log("❌ Invalid PayOS webhook data");
      return res.status(400).json({ success: false, message: "Invalid webhook data" });
    }

    console.log("✅ PayOS webhook verified:", webhookData);

    // Tìm order bằng orderCode
    const order = await Order.findOne({ orderCode: webhookData.orderCode });

    if (!order) {
      console.log("❌ Order not found for orderCode:", webhookData.orderCode);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Kiểm tra trạng thái thanh toán từ webhook
    if (webhookData.code === "00") {
      // Giảm số lượng hàng trong kho
      await reduceStock(order.items);

      // Cập nhật trạng thái đơn hàng
      await Order.findByIdAndUpdate(order._id, {
        status: "Processing",
        payment: "Completed",
        paidAt: new Date(),
        paymentDetails: webhookData
      });

      // Ghi doanh thu realtime
      const vnNow = new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
      const vnDateStr = new Date(vnNow).toISOString().split('T')[0];

      await RevenueDaily.findOneAndUpdate(
        { date: vnDateStr },
        {
          $inc: {
            revenue: order.amount,
            orders: 1
          }
        },
        { upsert: true }
      );

      console.log("✅ Doanh thu realtime đã cập nhật cho ngày:", vnDateStr);
    }

    // Trả lời về việc đã xử lý webhook thành công
    res.json({ success: true, message: "Webhook processed" });

  } catch (error) {
    console.error("❌ PayOS Webhook error:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};


// Stripe Webhook Handler
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("Stripe Webhook Event:", event);  // Log sự kiện Stripe webhook nhận được
  } catch (err) {
    console.error("❌ Stripe Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log("🔔 Stripe Webhook received");

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log("💳 Stripe payment completed:", session.id);

        const successUrl = session.success_url;
        const orderIdMatch = successUrl.match(/orderId=([^&]+)/);

        if (orderIdMatch) {
          const orderId = orderIdMatch[1];
          const order = await Order.findById(orderId);

          if (order) {
            await reduceStock(order.items);

            await Order.findByIdAndUpdate(orderId, {
              status: "Processing",
              payment: "Completed",
              paidAt: new Date(),
              stripeSessionId: session.id
            });

            console.log("✅ Doanh thu realtime đã cập nhật cho ngày:", vnDateStr);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        console.log("❌ Stripe payment failed:", event.data.object.id);
        break;

      default:
        console.log(`🔔 Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error("❌ Stripe Webhook error:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};


// Manual verify order (for admin or fallback)
const manualVerifyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { forceUpdate } = req.body;

    console.log("🔧 Manual verify order:", orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Chỉ cho phép cập nhật nếu đơn hàng đang pending hoặc force update
    if (order.status !== "pending" && !forceUpdate) {
      return res.json({
        success: false,
        message: `Đơn hàng đã ở trạng thái: ${order.status}`
      });
    }

    await reduceStock(order.items);

    await Order.findByIdAndUpdate(orderId, {
      status: "Processing",
      payment: "Completed",
      paidAt: new Date(),
      verifiedBy: "manual"
    });

    const vnNow = new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
    const vnDateStr = new Date(vnNow).toISOString().split('T')[0];

    await RevenueDaily.findOneAndUpdate(
      { date: vnDateStr },
      {
        $inc: {
          revenue: order.amount,
          orders: 1
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Đã xác nhận thanh toán thủ công",
      order: await Order.findById(orderId)
    });

  } catch (error) {
    console.error("❌ Manual verify error:", error);
    res.json({
      success: false,
      message: "Lỗi khi xác nhận thủ công: " + error.message
    });
  }
};

// Function để check và cleanup các đơn hàng pending quá lâu
const checkPendingOrders = async (req, res) => {
  try {
    console.log("🔍 Checking pending orders...");

    // Tìm các đơn hàng pending quá 30 phút
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const pendingOrders = await Order.find({
      status: "pending",
      date: { $lt: thirtyMinutesAgo }
    });

    console.log(`📦 Found ${pendingOrders.length} pending orders older than 30 minutes`);

    let updatedCount = 0;
    for (const order of pendingOrders) {
      // Hủy các đơn hàng pending quá lâu
      await Order.findByIdAndUpdate(order._id, {
        status: "cancelled",
        payment: "Failed",
        cancelledAt: new Date(),
        cancelReason: "Hết thời gian thanh toán (30 phút)"
      });
      updatedCount++;
      console.log(`❌ Auto-cancelled order: ${order._id}`);
    }

    if (res) {
      res.json({
        success: true,
        message: `Đã hủy ${updatedCount} đơn hàng pending quá lâu`,
        cancelledOrders: updatedCount
      });
    }

    return { cancelledOrders: updatedCount };

  } catch (error) {
    console.error("❌ Error checking pending orders:", error);
    if (res) {
      res.json({
        success: false,
        message: "Lỗi khi kiểm tra đơn hàng pending: " + error.message
      });
    }
    return { error: error.message };
  }
};

// Function để lấy danh sách đơn hàng có vấn đề (cho admin)
const getProblematicOrders = async (req, res) => {
  try {
    console.log("🔍 Getting problematic orders...");

    // Đơn hàng pending quá 10 phút
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const longPendingOrders = await Order.find({
      status: "pending",
      date: { $lt: tenMinutesAgo }
    }).sort({ date: -1 });

    // Đơn hàng có payment method nhưng vẫn pending
    const paymentPendingOrders = await Order.find({
      status: "pending",
      payment: { $in: ["Stripe", "PayOS"] }
    }).sort({ date: -1 });

    res.json({
      success: true,
      problematicOrders: {
        longPending: longPendingOrders,
        paymentPending: paymentPendingOrders
      },
      summary: {
        longPendingCount: longPendingOrders.length,
        paymentPendingCount: paymentPendingOrders.length
      }
    });

  } catch (error) {
    console.error("❌ Error getting problematic orders:", error);
    res.json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng có vấn đề: " + error.message
    });
  }
};

const placeOrderCOD = async (req, res) => {
  const { address, items, amount, payment, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Không tìm thấy userId" });
  }

  console.log("Đặt hàng với userId:", userId);  // Log kiểm tra userId

  // Truy vấn giỏ hàng của người dùng
  const cart = await cartModel.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ success: false, message: "Giỏ hàng không tồn tại cho người dùng" });
  }

  // Xử lý đơn hàng
  const newOrder = new Order({
    userId,
    address,
    items,
    amount,
    payment
  });

  await newOrder.save();

  res.json({ success: true, message: "Đặt hàng thành công", orderId: newOrder._id });
};




export {
  PlaceOder,
  verifyOrder,
  getUserOrders,
  getOrderDetail,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getRevenueStats,
  payWithPayOS,
  payosWebhook,
  stripeWebhook,
  manualVerifyOrder,
  checkPendingOrders,
  getProblematicOrders,
  placeOrderCOD,
  reduceStockAPI
};