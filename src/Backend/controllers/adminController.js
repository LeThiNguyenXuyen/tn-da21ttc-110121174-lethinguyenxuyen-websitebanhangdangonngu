// controllers/adminController.js
import userModel from '../models/UserModel.js';
import productModel from '../models/productModels.js';
import Order from '../models/Order.js';
import { checkPendingOrders } from './orderController.js';




export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Thống kê đơn hàng
    const [
      totalOrders,
      todayOrders,
      yesterdayOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ date: { $gte: today } }),
      Order.countDocuments({ date: { $gte: yesterday, $lt: today } }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' })
    ]);

    // Doanh thu tổng
    const revenueStats = await Order.aggregate([
      {
        $addFields: {
          statusLower: { $toLower: "$status" },
          paymentLower: { $toLower: "$payment" }
        }
      },
      {
        $match: {
          $or: [
            {
              $and: [
                { paymentLower: { $ne: 'cod' } },
                { statusLower: { $in: ['paid', 'processing', 'shipped', 'delivered'] } }
              ]
            },
            {
              $and: [
                { paymentLower: 'cod' },
                { statusLower: 'delivered' } // ✅ chỉ tính khi COD đã giao hàng
              ]
            }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          averageOrderValue: { $avg: '$amount' }
        }
      }
    ]);

    // Doanh thu hôm nay
    const todayRevenue = await Order.aggregate([
      {
        $addFields: {
          statusLower: { $toLower: "$status" },
          paymentLower: { $toLower: "$payment" }
        }
      },
      {
        $match: {
          date: { $gte: today },
          $or: [
            {
              $and: [
                { paymentLower: { $ne: 'cod' } },
                { statusLower: { $in: ['paid', 'processing', 'shipped', 'delivered'] } }
              ]
            },
            {
              $and: [
                { paymentLower: 'cod' },
                { statusLower: 'delivered' } // ✅ chỉ tính COD đã giao
              ]
            }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Doanh thu 7 ngày gần nhất
    const last7DaysRevenue = await Order.aggregate([
      {
        $addFields: {
          statusLower: { $toLower: "$status" },
          paymentLower: { $toLower: "$payment" }
        }
      },
      {
        $match: {
          date: { $gte: last7Days },
          $or: [
            {
              $and: [
                { paymentLower: { $ne: 'cod' } },
                { statusLower: { $in: ['paid', 'processing', 'shipped', 'delivered'] } }
              ]
            },
            {
              $and: [
                { paymentLower: 'cod' },
                { statusLower: 'delivered' } // ✅ chỉ tính COD đã giao
              ]
            }
          ]
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Giữ nguyên các phần còn lại: user/product/topProduct/brand

    const [totalUsers, todayUsers] = await Promise.all([
      userModel.countDocuments(),
      userModel.countDocuments({ createdAt: { $gte: today } })
    ]);

    const totalProducts = await productModel.countDocuments();

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items._id',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    const brandStats = await productModel.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const stats = {
      orders: {
        total: totalOrders,
        today: todayOrders,
        yesterday: yesterdayOrders,
        growth: yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1) : 0,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders
      },
      revenue: {
        total: revenueStats[0]?.totalRevenue || 0,
        today: todayRevenue[0]?.total || 0,
        average: revenueStats[0]?.averageOrderValue || 0,
        last7Days: last7DaysRevenue
      },
      users: {
        total: totalUsers,
        today: todayUsers
      },
      products: {
        total: totalProducts
      },
      charts: {
        dailyRevenue: last7DaysRevenue,
        topProducts,
        brandStats
      }
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error);
    res.json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard: ' + error.message
    });
  }
};

// Lấy danh sách tất cả người dùng
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Tạo query tìm kiếm
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const [users, totalUsers] = await Promise.all([
      userModel.find(searchQuery)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      userModel.countDocuments(searchQuery)
    ]);

    // Lấy thống kê đơn hàng cho mỗi user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderStats = await Order.aggregate([
          { $match: { userId: user._id.toString() } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$amount' },
              lastOrderDate: { $max: '$date' }
            }
          }
        ]);

        return {
          ...user.toObject(),
          stats: orderStats[0] || {
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: null
          }
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error getting users:', error);
    res.json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng: ' + error.message
    });
  }
};

// Lấy chi tiết người dùng
export const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId).select('-password');
    if (!user) {
      return res.json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Lấy đơn hàng của user
    const orders = await Order.find({ userId })
      .sort({ date: -1 })
      .limit(10);

    // Thống kê chi tiết
    const stats = await Order.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$amount' },
          averageOrderValue: { $avg: '$amount' },
          firstOrderDate: { $min: '$date' },
          lastOrderDate: { $max: '$date' }
        }
      }
    ]);

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        recentOrders: orders,
        stats: stats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          firstOrderDate: null,
          lastOrderDate: null
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting user detail:', error);
    res.json({
      success: false,
      message: 'Lỗi khi lấy chi tiết người dùng: ' + error.message
    });
  }
};
// Lấy tất cả bình luận
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('userId', 'name email').sort({ date: -1 });
    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('❌ Error getting all reviews:', error);
    res.json({
      success: false,
      message: 'Lỗi khi lấy danh sách bình luận: ' + error.message
    });
  }
};

// Xử lý báo cáo bình luận
export const handleReportedReviews = async (req, res) => {
  try {
    const { reviewId, action } = req.body; // Action có thể là 'remove' hoặc 'ignore'

    if (!reviewId || !action) {
      return res.json({ success: false, message: "Thiếu thông tin báo cáo" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.json({ success: false, message: "Không tìm thấy bình luận" });
    }

    if (action === 'remove') {
      // Nếu hành động là xóa bình luận
      await review.remove();
      res.json({
        success: true,
        message: "Bình luận đã bị xóa"
      });
    } else {
      // Nếu hành động là bỏ qua báo cáo
      review.reported = false;
      await review.save();
      res.json({
        success: true,
        message: "Báo cáo đã được bỏ qua"
      });
    }
  } catch (error) {
    console.error('❌ Error handling reported reviews:', error);
    res.json({
      success: false,
      message: 'Lỗi khi xử lý bình luận báo cáo: ' + error.message
    });
  }
};
