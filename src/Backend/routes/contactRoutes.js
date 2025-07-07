import express from 'express';
import { sendContactEmail } from '../controllers/contactController.js';

const contactRouter = express.Router();

// Route gửi email liên hệ
contactRouter.post('/send', sendContactEmail);

export default contactRouter;
