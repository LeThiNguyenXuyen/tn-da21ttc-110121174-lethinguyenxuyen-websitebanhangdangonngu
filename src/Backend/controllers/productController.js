import productModel from "../models/productModels.js";
import promotionModel from "../models/promotionModel.js";
import fs from "fs";

export const addProduct = async (req, res) => {
  try {
    const { name, price, importPrice, category, brand, sizes, description, quantity} = req.body;

    if (!req.file || !name || !price || !importPrice || !category || !brand || !sizes) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin sản phẩm hoặc ảnh" });
    }

    const image = req.file.filename;

    const product = new productModel({
      name,
      price: parseFloat(price),

      importPrice: parseFloat(importPrice),
      category,
      brand,
      sizes: sizes.split(",").map(s => s.trim()),
      image,
      description,
      quantity: parseInt(quantity) || 0,
    });

    await product.save();
    res.status(201).json({ success: true, message: "Thêm sản phẩm thành công" });
  } catch (error) {
    console.error("❌ Add Product Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi thêm sản phẩm", error: error.message });
  }
};

export const listproduct = async (req, res) => {
  try {
    const products = await productModel.find({});

    // Thêm thông tin khuyến mãi cho từng sản phẩm
    const productsWithPromotions = await Promise.all(
      products.map(async (product) => {
        // Sử dụng forDisplay = true để chỉ hiển thị khuyến mãi không có điều kiện đơn hàng tối thiểu
        const promotions = await promotionModel.findApplicablePromotions(product._id, 0, true);
        const bestPromotion = promotions.length > 0 ? promotions[0] : null;

        let discountedPrice = product.price;
        let discountPercentage = 0;

        if (bestPromotion && bestPromotion.isActive) {
          discountedPrice = bestPromotion.calculateDiscountedPrice(product.price);
          discountPercentage = ((product.price - discountedPrice) / product.price * 100).toFixed(0);
        }

        return {
          ...product.toObject(),
          promotion: bestPromotion ? {
            id: bestPromotion._id,
            title: bestPromotion.title,
            type: bestPromotion.type,
            value: bestPromotion.value,
            discountPercentage
          } : null,
          discountedPrice,
          hasPromotion: !!bestPromotion
        };
      })
    );

    res.json({ success: true, data: productsWithPromotions });
  } catch (error) {
    console.error("❌ List Product Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách sản phẩm" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    const imagePath = `uploads/${deletedProduct.image}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("❌ Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi xóa sản phẩm" });
  }
};

// 👇 thêm vào cuối file (sau deleteProduct)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      importPrice,
      category,
      brand,
      sizes,
      description,
      quantity,
    } = req.body; // Lưu ý bỏ `minStock` nếu không cần

    const existingProduct = await productModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    // Nếu có file ảnh mới, xoá ảnh cũ
    if (req.file) {
      const oldImagePath = `uploads/${existingProduct.image}`;
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      existingProduct.image = req.file.filename;
    }

    // Cập nhật các trường khác
    existingProduct.name = name;
    existingProduct.price = parseFloat(price);
    existingProduct.importPrice = parseFloat(importPrice);
    existingProduct.category = category;
    existingProduct.brand = brand;
    existingProduct.sizes = typeof sizes === "string"
      ? sizes.split(",").map((s) => s.trim())
      : sizes;
    existingProduct.description = description;

    // Cập nhật thông tin tồn kho nếu có
    if (quantity !== undefined) {
      existingProduct.quantity = parseInt(quantity) || 0; // Cập nhật quantity
    }

    await existingProduct.save();

    res.status(200).json({ success: true, message: "Cập nhật sản phẩm thành công" });
  } catch (error) {
    console.error("❌ Update Product Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật sản phẩm", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    // Lấy khuyến mãi áp dụng cho sản phẩm này (cho trang chi tiết, hiển thị tất cả khuyến mãi)
    const promotions = await promotionModel.findApplicablePromotions(product._id, 0, false);
    const bestPromotion = promotions.length > 0 ? promotions[0] : null;

    let discountedPrice = product.price;
    let discountPercentage = 0;

    if (bestPromotion && bestPromotion.isActive) {
      discountedPrice = bestPromotion.calculateDiscountedPrice(product.price);
      discountPercentage = ((product.price - discountedPrice) / product.price * 100).toFixed(0);
    }

    const productWithPromotion = {
      ...product.toObject(),
      promotion: bestPromotion ? {
        id: bestPromotion._id,
        title: bestPromotion.title,
        description: bestPromotion.description,
        type: bestPromotion.type,
        value: bestPromotion.value,
        discountPercentage,
        startDate: bestPromotion.startDate,
        endDate: bestPromotion.endDate
      } : null,
      discountedPrice,
      hasPromotion: !!bestPromotion,
      allPromotions: promotions.map(p => ({
        id: p._id,
        title: p.title,
        description: p.description,
        type: p.type,
        value: p.value
      }))
    };

    res.json({ success: true, data: productWithPromotion });
  } catch (err) {
    console.error("❌ Get Product Error:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy sản phẩm" });
  }
};


