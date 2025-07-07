import express from "express";
import { 
  addToCart, 
  removeFromCart, 
  updateCartQuantity, 
  getCart, 
  syncCart, 
  clearCart 
} from "../controllers/cartController.js";
import auth from "../middleware/auth.js";

const cartRouter = express.Router();

// Tất cả routes đều cần authentication
cartRouter.post("/add", auth, addToCart);
cartRouter.post("/remove", auth, removeFromCart);
cartRouter.post("/update", auth, updateCartQuantity);
cartRouter.post("/get", auth, getCart);
cartRouter.post("/sync", auth, syncCart);
cartRouter.post("/clear", auth, clearCart);

export default cartRouter;
