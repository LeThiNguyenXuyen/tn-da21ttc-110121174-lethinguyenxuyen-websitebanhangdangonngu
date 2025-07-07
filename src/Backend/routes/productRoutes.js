import express from 'express'
import { addProduct,listproduct,deleteProduct,updateProduct,getProductById } from '../controllers/productController.js';
import productModel from '../models/productModels.js';
import multer from 'multer'

const productRouter = express.Router();

// image storage configuration
const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const uploads = multer({storage:storage})

// Product routes
productRouter.post("/add",uploads.single("image"),addProduct)
productRouter.get("/list",listproduct)
productRouter.delete("/delete/:id", deleteProduct);
productRouter.put("/update/:id", uploads.single("image"), updateProduct);

// Helper function để loại bỏ dấu tiếng Việt
const removeAccents = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

// Search endpoint với hỗ trợ tìm kiếm không dấu
productRouter.get("/search", async (req, res) => {
  try {
    const originalQuery = req.query.q || '';
    const q = originalQuery.toLowerCase().trim();
    const qNoAccent = removeAccents(q);

    if (!q) {
      return res.json({ success: false, message: "Từ khóa tìm kiếm không được để trống" });
    }

    const products = await productModel.find();

    // Tìm kiếm với cả có dấu và không dấu
    const filtered = products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const nameNoAccent = removeAccents(name);
      const brand = (p.brand || '').toLowerCase();
      const brandNoAccent = removeAccents(brand);
      const description = (p.description || '').toLowerCase();
      const descriptionNoAccent = removeAccents(description);
      const category = (p.category || '').toLowerCase();
      const categoryNoAccent = removeAccents(category);

      // Tìm kiếm với query gốc (có dấu)
      const matchOriginal =
        name.includes(q) ||
        brand.includes(q) ||
        description.includes(q) ||
        category.includes(q);

      // Tìm kiếm với query không dấu
      const matchNoAccent =
        nameNoAccent.includes(qNoAccent) ||
        brandNoAccent.includes(qNoAccent) ||
        descriptionNoAccent.includes(qNoAccent) ||
        categoryNoAccent.includes(qNoAccent);

      // Tìm kiếm từng từ riêng lẻ
      const words = q.split(' ').filter(word => word.length > 1);
      const wordsNoAccent = qNoAccent.split(' ').filter(word => word.length > 1);

      const matchWords = words.some(word =>
        name.includes(word) ||
        brand.includes(word) ||
        description.includes(word) ||
        category.includes(word)
      );

      const matchWordsNoAccent = wordsNoAccent.some(word =>
        nameNoAccent.includes(word) ||
        brandNoAccent.includes(word) ||
        descriptionNoAccent.includes(word) ||
        categoryNoAccent.includes(word)
      );

      return matchOriginal || matchNoAccent || matchWords || matchWordsNoAccent;
    });

    // Sắp xếp kết quả theo độ liên quan
    const sortedResults = filtered.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aNameNoAccent = removeAccents(aName);
      const bNameNoAccent = removeAccents(bName);

      // Ưu tiên sản phẩm có tên chứa từ khóa ở đầu
      const aStartsWith = aName.startsWith(q) || aNameNoAccent.startsWith(qNoAccent);
      const bStartsWith = bName.startsWith(q) || bNameNoAccent.startsWith(qNoAccent);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Ưu tiên sản phẩm có tên chứa từ khóa hoàn chỉnh
      const aIncludes = aName.includes(q) || aNameNoAccent.includes(qNoAccent);
      const bIncludes = bName.includes(q) || bNameNoAccent.includes(qNoAccent);

      if (aIncludes && !bIncludes) return -1;
      if (!aIncludes && bIncludes) return 1;

      return 0;
    });

    res.json({
      success: true,
      data: sortedResults,
      query: originalQuery,
      queryNoAccent: qNoAccent,
      count: sortedResults.length
    });
  } catch (error) {
    console.error("Search error:", error);
    res.json({ success: false, message: "Lỗi khi tìm kiếm sản phẩm" });
  }
});

// Get product by ID - must be after search route
productRouter.get("/:id", getProductById);

export default productRouter;