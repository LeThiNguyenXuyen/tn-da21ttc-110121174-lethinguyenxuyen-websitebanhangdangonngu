import express from 'express';
import Product from '../models/productModels.js';


const router = express.Router();

// GET: Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm' });
  }
});

// POST: Thêm sản phẩm
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Thêm sản phẩm thành công' });
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi thêm sản phẩm' });
  }
});

// DELETE: Xoá sản phẩm theo ID
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xoá sản phẩm thành công' });
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi xoá sản phẩm' });
  }
});

export default router;
