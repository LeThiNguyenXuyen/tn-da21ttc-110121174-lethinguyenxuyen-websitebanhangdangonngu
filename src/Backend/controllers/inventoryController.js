import productModel from "../models/productModels.js";
import Order from "../models/Order.js";

// Lấy thống kê tồn kho
export const getInventoryStats = async (req, res) => {
  try {
    const products = await productModel.find();
    
    const stats = {
      totalProducts: products.length,
      inStock: products.filter(p => p.quantity > p.minStock).length,
      lowStock: products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length,
      outOfStock: products.filter(p => p.quantity === 0).length,
      totalValue: products.reduce((sum, p) => sum + (p.quantity * p.importPrice), 0),
      totalRetailValue: products.reduce((sum, p) => sum + (p.quantity * p.price), 0)
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error getting inventory stats:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy thống kê tồn kho" });
  }
};

// Lấy danh sách sản phẩm với thông tin tồn kho
export const getInventoryList = async (req, res) => {
  try {
    const { status, category, brand, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = {};
    
    // Lọc theo trạng thái tồn kho
    if (status === 'in-stock') {
      query.quantity = { $gt: 0 };
    } else if (status === 'low-stock') {
      query.$expr = { $and: [{ $lte: ['$quantity', '$minStock'] }, { $gt: ['$quantity', 0] }] };
    } else if (status === 'out-of-stock') {
      query.quantity = 0;
    }
    
    // Lọc theo category và brand
    if (category) query.category = category;
    if (brand) query.brand = brand;
    
    // Sắp xếp
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const products = await productModel.find(query).sort(sortOptions);
    
    // Thêm thông tin trạng thái cho mỗi sản phẩm
    const productsWithStatus = products.map(product => ({
      ...product.toObject(),
      stockStatus: product.quantity === 0 ? 'out-of-stock' : 
                   product.quantity <= product.minStock ? 'low-stock' : 'in-stock',
      stockValue: product.quantity * product.importPrice,
      retailValue: product.quantity * product.price
    }));
    
    res.json({ success: true, products: productsWithStatus });
  } catch (error) {
    console.error("Error getting inventory list:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách tồn kho" });
  }
};

// Cập nhật số lượng tồn kho
export const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, minStock, action = 'set' } = req.body;
    
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    
    let newQuantity = product.quantity;
    
    if (action === 'add') {
      newQuantity += parseInt(quantity);
    } else if (action === 'subtract') {
      newQuantity = Math.max(0, newQuantity - parseInt(quantity));
    } else {
      newQuantity = parseInt(quantity);
    }
    
    const updateData = { quantity: newQuantity };
    if (minStock !== undefined) {
      updateData.minStock = parseInt(minStock);
    }
    
    // Cập nhật thời gian nhập kho nếu tăng số lượng
    if (action === 'add' || (action === 'set' && newQuantity > product.quantity)) {
      updateData.lastRestocked = new Date();
    }
    
    await productModel.findByIdAndUpdate(productId, updateData);
    
    res.json({ 
      success: true, 
      message: "Cập nhật tồn kho thành công",
      newQuantity,
      stockStatus: newQuantity === 0 ? 'out-of-stock' : 
                   newQuantity <= (minStock || product.minStock) ? 'low-stock' : 'in-stock'
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật tồn kho" });
  }
};

// Lấy lịch sử xuất nhập kho (từ orders)
export const getStockHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 50 } = req.query;
    
    // Lấy lịch sử từ orders
    const orders = await Order.find({
      'items._id': productId,
      status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }
    })
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .select('_id date status items amount');
    
    const history = orders.map(order => {
      const item = order.items.find(item => item._id === productId);
      return {
        orderId: order._id,
        date: order.date,
        type: 'xuất',
        quantity: -item.quantity,
        reason: `Đơn hàng #${order._id.toString().slice(-6)}`,
        status: order.status
      };
    });
    
    res.json({ success: true, history });
  } catch (error) {
    console.error("Error getting stock history:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy lịch sử xuất nhập kho" });
  }
};

// Cảnh báo tồn kho thấp
export const getLowStockAlerts = async (req, res) => {
  try {
    const lowStockProducts = await productModel.find({
      $expr: { $lte: ['$quantity', '$minStock'] },
      quantity: { $gt: 0 }
    }).sort({ quantity: 1 });
    
    const outOfStockProducts = await productModel.find({
      quantity: 0
    }).sort({ name: 1 });
    
    res.json({ 
      success: true, 
      alerts: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      }
    });
  } catch (error) {
    console.error("Error getting low stock alerts:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy cảnh báo tồn kho" });
  }
};

// Nhập kho hàng loạt
export const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of {productId, quantity, action}
    
    const results = [];
    
    for (const update of updates) {
      try {
        const product = await productModel.findById(update.productId);
        if (!product) {
          results.push({
            productId: update.productId,
            success: false,
            message: "Không tìm thấy sản phẩm"
          });
          continue;
        }
        
        let newQuantity = product.quantity;
        
        if (update.action === 'add') {
          newQuantity += parseInt(update.quantity);
        } else if (update.action === 'subtract') {
          newQuantity = Math.max(0, newQuantity - parseInt(update.quantity));
        } else {
          newQuantity = parseInt(update.quantity);
        }
        
        await productModel.findByIdAndUpdate(update.productId, {
          quantity: newQuantity,
          lastRestocked: new Date()
        });
        
        results.push({
          productId: update.productId,
          success: true,
          newQuantity,
          productName: product.name
        });
      } catch (error) {
        results.push({
          productId: update.productId,
          success: false,
          message: error.message
        });
      }
    }
    
    res.json({ success: true, results });
  } catch (error) {
    console.error("Error bulk updating stock:", error);
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật hàng loạt" });
  }
};
