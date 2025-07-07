// routes/addressRoutes.js

import express from 'express';
import { addAddress,getAddressList, deleteAddress,updateAddress,getAddressById } from '../controllers/addressController.js'; // Import controller addAddress
import auth from '../middleware/auth.js';

const router = express.Router();

// Route thêm địa chỉ, không cần auth middleware nữa
router.post('/add',auth, addAddress);  // Không cần xác thực qua token

router.get('/list', auth, getAddressList);

router.delete('/delete/:addressId',auth, deleteAddress);

router.put('/edit/:addressId', auth, updateAddress);

router.get('/:addressId', auth, getAddressById);
export default router;
