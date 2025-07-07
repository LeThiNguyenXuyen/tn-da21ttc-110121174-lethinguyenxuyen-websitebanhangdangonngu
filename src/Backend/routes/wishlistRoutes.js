// routes/wishlistRoutes.js
import express from 'express';
import auth from '../middleware/auth.js';
import { addToWishlist, removeFromWishlist, getUserWishlist, checkWishlistStatus } from '../controllers/wishlistController.js';

const router = express.Router();

// Wishlist routes
router.post('/add', auth, addToWishlist);
router.delete('/remove/:productId', auth, removeFromWishlist);
router.get('/user', auth, getUserWishlist);
router.get('/check/:productId', auth, checkWishlistStatus);

export default router;
